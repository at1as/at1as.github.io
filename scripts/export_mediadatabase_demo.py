#!/usr/bin/env python3
"""Export a lightweight, curated hosted demo of Media-Database into sites/mediadatabase/.

Reads from a local Media-Database checkout (never modifying it), selects a curated
subset of titles across Movies, Series, Standup, and Live Music, transcodes only the
copied demo posters into lightweight JPEGs, strips local drive paths / <video> tags,
rewrites _resources -> resources for Jekyll compatibility, and injects the hosted
"Fork me on GitHub" ribbon, SEO metadata, JSON-LD, and production-only GA4.
"""

from __future__ import annotations

import argparse
import copy
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys


REPO_URL = "https://github.com/at1as/Media-Database"
SITE_ORIGIN = "https://www.jasonwillems.com"
BASE_URL = f"{SITE_ORIGIN}/sites/mediadatabase/output/"
SHARE_CARD_URL = f"{BASE_URL}share-card.png"
GA_MEASUREMENT_ID = "G-Q5N6H3PVG2"

RIBBON_CSS = """
      /* Hosted demo "Fork me on GitHub" corner ribbon */
      body {
        position: relative;
      }
      .github-fork-ribbon-wrap {
        position: absolute;
        top: 0;
        right: 0;
        width: 136px;
        height: 136px;
        overflow: hidden;
        pointer-events: none;
        z-index: 4;
      }
      .github-fork-ribbon {
        position: absolute;
        top: 30px;
        right: -40px;
        width: 186px;
        padding: 5px 0;
        background: linear-gradient(135deg, #24292f 0%, #1b1f23 100%);
        color: #ffffff !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-align: center;
        text-decoration: none !important;
        transform: rotate(45deg);
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.35);
        border-top: 1px dashed rgba(255, 255, 255, 0.35);
        border-bottom: 1px dashed rgba(255, 255, 255, 0.35);
        pointer-events: auto;
        transition: background 0.18s ease, box-shadow 0.18s ease;
      }
      .github-fork-ribbon:hover,
      .github-fork-ribbon:focus-visible {
        background: linear-gradient(135deg, #0878a4 0%, #03658c 100%);
        color: #ffffff !important;
        box-shadow: 0 4px 14px rgba(8, 120, 164, 0.45);
        outline: none;
      }
      @media (min-width: 769px) {
        nav.navbar {
          padding-right: 118px;
        }
      }
      @media (max-width: 768px) {
        .github-fork-ribbon-wrap {
          width: 108px;
          height: 108px;
        }
        .github-fork-ribbon {
          top: 22px;
          right: -36px;
          width: 152px;
          font-size: 9.5px;
          padding: 4px 0;
        }
        nav.navbar {
          padding-right: 78px;
        }
      }
"""

RIBBON_HTML = (
    '<div class="github-fork-ribbon-wrap">'
    f'<a class="github-fork-ribbon" href="{REPO_URL}" target="_blank" '
    'rel="noopener noreferrer" aria-label="Fork Media Database on GitHub">'
    "Fork me on GitHub</a></div>"
)

GA4_SNIPPET = f"""    <script>
      if (location.protocol === "https:" && /(^|\\.)jasonwillems\\.com$/i.test(location.hostname)) {{
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {{ window.dataLayer.push(arguments); }};
        window.gtag("js", new Date());
        window.gtag("config", "{GA_MEASUREMENT_ID}", {{ page_title: document.title }});
        var s = document.createElement("script");
        s.async = true;
        s.src = "https://www.googletagmanager.com/gtag/js?id={GA_MEASUREMENT_ID}";
        document.head.appendChild(s);
      }}
    </script>"""


def _votes(item: dict) -> int:
    raw = item.get("votes")
    if isinstance(raw, (int, float)):
        return int(raw)
    if isinstance(raw, str):
        digits = re.sub(r"[^\d]", "", raw)
        return int(digits) if digits else 0
    return 0


def _poster_key(item: dict, mediatype: str) -> str:
    if mediatype == "series":
        return str((item.get("directory") or {}).get("name") or "")
    return str((item.get("file_metadata") or {}).get("filename") or "")


def _has_poster(source_root: Path, subdir: str, item: dict, mediatype: str) -> Path | None:
    key = _poster_key(item, mediatype)
    if not key:
        return None
    candidate = source_root / "_output" / "images" / subdir / f"{key}.png"
    return candidate if candidate.is_file() else None


def select_curated(
    data: dict,
    source_root: Path,
    subdir: str,
    mediatype: str,
    limit: int | None,
    renderable_fn,
) -> dict:
    """Pick top-voted renderable items with posters and rich metadata."""
    candidates = []
    seen_output_names = set()
    for key, raw in data.items():
        if not renderable_fn(raw, mediatype):
            continue
        poster = _has_poster(source_root, subdir, raw, mediatype)
        if not poster:
            continue
        title = str(raw.get("title") or "").strip()
        year = str(raw.get("year") or "").strip()
        if not title or not year:
            continue
        # Avoid duplicate HTML output filenames for same title/year
        dedup_year = year[:4] if mediatype == "series" else year
        dedup_key = (title.lower(), dedup_year)
        if dedup_key in seen_output_names:
            continue
        seen_output_names.add(dedup_key)

        richness = 0
        if raw.get("description"):
            richness += 2
        if raw.get("genre"):
            richness += 1
        if raw.get("stars"):
            richness += 1
        if raw.get("rating"):
            richness += 1
        if raw.get("trailer_url"):
            richness += 1
        if mediatype == "series" and raw.get("episodes"):
            richness += 2
        if mediatype != "series" and (raw.get("media") or {}).get("resolution"):
            richness += 1

        candidates.append((richness, _votes(raw), key, raw))

    if limit is not None:
        # Prefer complete metadata first, then highest IMDb vote count
        candidates.sort(key=lambda row: (row[0] >= 5, row[1], row[0]), reverse=True)
        candidates = candidates[:limit]
        # Display sorted by rating desc then votes desc for an appealing default view
        candidates.sort(
            key=lambda row: (float(row[3].get("rating") or 0), row[1]),
            reverse=True,
        )
    else:
        candidates.sort(
            key=lambda row: (float(row[3].get("rating") or 0), row[1]),
            reverse=True,
        )

    result = {}
    for _, _, key, raw in candidates:
        item = copy.deepcopy(raw)
        # Strip private local filesystem paths so no local drive layout leaks
        fm = item.get("file_metadata")
        if isinstance(fm, dict):
            fm.pop("absolute_path", None)
            fm.pop("relative_path", None)
        directory = item.get("directory")
        if isinstance(directory, dict):
            directory.pop("absolute_path", None)
            directory.pop("path", None)
        result[key] = item
    return result


def transcode_posters(
    selected: dict,
    source_root: Path,
    dest_output: Path,
    subdir: str,
    mediatype: str,
    max_width: int = 340,
) -> int:
    """Transcode only selected demo posters into lightweight JPEGs (read-only on source)."""
    dest_dir = dest_output / "images" / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    count = 0
    for item in selected.values():
        src = _has_poster(source_root, subdir, item, mediatype)
        if not src:
            continue
        key = _poster_key(item, mediatype)
        dst = dest_dir / f"{key}.jpg"
        subprocess.run(
            [
                "magick",
                str(src),
                "-auto-orient",
                "-resize",
                f"{max_width}x>",
                "-strip",
                "-interlace",
                "Plane",
                "-sampling-factor",
                "4:2:0",
                "-quality",
                "78",
                str(dst),
            ],
            check=True,
        )
        count += 1
    return count


def build_share_card(source_root: Path, dest_png: Path) -> None:
    """Compose a crisp 1200x630 PNG social share card from the catalog tiles screenshot."""
    tiles_jpg = source_root / "docs" / "images" / "movie-tiles.jpg"
    svg_overlay = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141923"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#141923" stop-opacity="0.98"/>
      <stop offset="52%" stop-color="#141923" stop-opacity="0.90"/>
      <stop offset="100%" stop-color="#141923" stop-opacity="0.22"/>
    </linearGradient>
    <linearGradient id="bottom-fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.92"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#fade)"/>
  <rect x="0" y="538" width="1200" height="92" fill="#111827" fill-opacity="0.96"/>
  <line x1="0" y1="538" x2="1200" y2="538" stroke="#334155" stroke-width="1"/>
  <rect x="0" y="0" width="1200" height="6" fill="#0878a4"/>
  <text x="68" y="138" font-family="Helvetica Neue, Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="2.6" fill="#66b3ff">OPEN-SOURCE LOCAL CATALOG · LIVE DEMO</text>
  <text x="68" y="222" font-family="Helvetica Neue, Arial, sans-serif" font-size="66" font-weight="800" letter-spacing="-2" fill="#ffffff">Movie &amp; TV</text>
  <text x="68" y="294" font-family="Helvetica Neue, Arial, sans-serif" font-size="66" font-weight="800" letter-spacing="-2" fill="#ffffff">Database</text>
  <text x="68" y="352" font-family="Helvetica Neue, Arial, sans-serif" font-size="24" fill="#cbd5e1">Browse movies, TV series, stand-up, and live</text>
  <text x="68" y="384" font-family="Helvetica Neue, Arial, sans-serif" font-size="24" fill="#cbd5e1">concerts with IMDb metadata, tiles &amp; filters</text>
  <g transform="translate(68, 424)">
    <rect x="0" y="0" width="152" height="40" rx="20" fill="#0878a4"/>
    <text x="76" y="26" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="15" font-weight="700" fill="#ffffff">Table &amp; Tiles</text>
    <rect x="166" y="0" width="150" height="40" rx="20" fill="#2d3748" stroke="#4a5568"/>
    <text x="241" y="26" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="15" font-weight="600" fill="#e2e8f0">Dark Mode</text>
    <rect x="330" y="0" width="174" height="40" rx="20" fill="#2d3748" stroke="#4a5568"/>
    <text x="417" y="26" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-size="15" font-weight="600" fill="#e2e8f0">GitHub Open Source</text>
  </g>
  <text x="68" y="592" font-family="Helvetica Neue, Arial, sans-serif" font-size="20" fill="#cbd5e1">github.com/at1as/Media-Database</text>
  <text x="1132" y="592" text-anchor="end" font-family="Helvetica Neue, Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff">jasonwillems.com</text>
</svg>"""
    overlay_svg = dest_png.parent / ".share-overlay.svg"
    overlay_png = dest_png.parent / ".share-overlay.png"
    try:
        overlay_svg.write_text(svg_overlay, encoding="utf-8")
        subprocess.run(
            ["rsvg-convert", "-w", "1200", "-h", "630", str(overlay_svg), "-o", str(overlay_png)],
            check=True,
        )
        if tiles_jpg.is_file():
            subprocess.run(
                [
                    "magick",
                    str(tiles_jpg),
                    "-resize",
                    "1200x630^",
                    "-gravity",
                    "east",
                    "-extent",
                    "1200x630",
                    str(overlay_png),
                    "-compose",
                    "Over",
                    "-composite",
                    "PNG24:" + str(dest_png),
                ],
                check=True,
            )
        else:
            shutil.copy2(overlay_png, dest_png)
    finally:
        overlay_svg.unlink(missing_ok=True)
        overlay_png.unlink(missing_ok=True)


def build_seo_head(
    *,
    title: str,
    description: str,
    canonical_url: str,
    include_jsonld: bool,
    counts: dict[str, int],
) -> str:
    og_alt = (
        "Movie and TV Database: open-source static media catalog with IMDb ratings, "
        "dark mode, poster tiles, and live multi-filters."
    )
    parts = [
        f'    <meta name="description" content="{description}">',
        '    <meta name="author" content="Jason Willems">',
        f'    <link rel="canonical" href="{canonical_url}">',
        '    <meta property="og:type" content="website">',
        '    <meta property="og:site_name" content="Jason Willems">',
        f'    <meta property="og:title" content="{title}">',
        f'    <meta property="og:description" content="{description}">',
        f'    <meta property="og:url" content="{canonical_url}">',
        f'    <meta property="og:image" content="{SHARE_CARD_URL}">',
        '    <meta property="og:image:type" content="image/png">',
        '    <meta property="og:image:width" content="1200">',
        '    <meta property="og:image:height" content="630">',
        f'    <meta property="og:image:alt" content="{og_alt}">',
        '    <meta name="twitter:card" content="summary_large_image">',
        '    <meta name="twitter:site" content="@jasonwillems">',
        '    <meta name="twitter:creator" content="@jasonwillems">',
        f'    <meta name="twitter:title" content="{title}">',
        f'    <meta name="twitter:description" content="{description}">',
        f'    <meta name="twitter:image" content="{SHARE_CARD_URL}">',
        f'    <meta name="twitter:image:alt" content="{og_alt}">',
    ]
    if include_jsonld:
        graph = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "SoftwareApplication",
                    "@id": f"{BASE_URL}#app",
                    "url": BASE_URL,
                    "name": "Movie & TV Database",
                    "description": description,
                    "applicationCategory": "MultimediaApplication",
                    "operatingSystem": "Any",
                    "inLanguage": "en",
                    "author": {
                        "@type": "Person",
                        "name": "Jason Willems",
                        "url": f"{SITE_ORIGIN}/",
                    },
                    "codeRepository": REPO_URL,
                    "image": SHARE_CARD_URL,
                    "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
                },
                {
                    "@type": "BreadcrumbList",
                    "@id": f"{BASE_URL}#breadcrumbs",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE_ORIGIN}/"},
                        {"@type": "ListItem", "position": 2, "name": "Projects", "item": f"{SITE_ORIGIN}/sites/"},
                        {"@type": "ListItem", "position": 3, "name": "Movie & TV Database", "item": BASE_URL},
                    ],
                },
            ],
        }
        parts.append(
            '    <script type="application/ld+json">\n'
            + json.dumps(graph, indent=2)
            + "\n    </script>"
        )
    parts.append(GA4_SNIPPET)
    return "\n".join(parts)


def postprocess_html(
    html: str,
    *,
    is_detail: bool,
    page_title: str | None = None,
    sr_h1: str | None = None,
    seo_block: str | None = None,
    is_about: bool = False,
) -> str:
    # 1. Rewrite _resources -> resources so Jekyll never drops underscore directories
    html = html.replace("../_resources/", "../resources/").replace("../../_resources/", "../../resources/")

    # 2. Point poster images to transcoded .jpg copies
    html = re.sub(
        r'((?:images|\.\./images)/(?:movies|series|standup|live-music)/[^"]+?)\.png"',
        r'\1.jpg"',
        html,
    )

    # 3. Fix legacy typo in favicon rel attribute
    html = html.replace('rel="shotcut icon"', 'rel="shortcut icon"')

    # 4. Strip any local <video> playback tag so no broken local file path leaks
    html = re.sub(r'\s*<video\b[^>]*>.*?</video>', "", html, flags=re.S)

    if is_detail:
        # Mark demo detail iframe pages noindex, follow and keep title clean
        html = html.replace(
            '<meta charset="utf-8">',
            '<meta charset="utf-8">\n    <meta name="robots" content="noindex, follow">',
            1,
        )
        return html

    # Top-level catalog & about pages
    if page_title:
        html = re.sub(r"<title>.*?</title>", f"<title>{page_title}</title>", html, count=1, flags=re.S)

    if seo_block:
        html = html.replace("</title>", f"</title>\n{seo_block}", 1)

    # Inject GitHub corner ribbon CSS right before </head>
    html = html.replace("</head>", f"    <style>{RIBBON_CSS}    </style>\n  </head>", 1)

    # Inject GitHub corner ribbon (and optional visually-hidden H1 for accessibility/SEO) after <body...>
    body_injection = f"\n    {RIBBON_HTML}"
    if sr_h1:
        body_injection += f'\n    <h1 class="sr-only">{sr_h1}</h1>'
    html = re.sub(r"(<body\b[^>]*>)", r"\1" + body_injection, html, count=1)

    if is_about:
        # Update old repo name IMDB-Scrape -> Media-Database and note this is a hosted sample
        html = html.replace("https://github.com/at1as/IMDB-Scrape", REPO_URL)
        html = html.replace(
            "A local movie database for your personal collection",
            "Hosted sample catalog from the open-source Media Database project",
        )
        html = html.replace(
            "Media Database creates a local movie database containing information related to your movie collection.",
            "This hosted demo showcases a curated sample catalog generated by the open-source Media Database project. "
            "When run locally against your own drives, Media Database scans your folders, fetches IMDb metadata, "
            "and builds a private searchable website for your collection.",
        )

    return html


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        type=Path,
        default=Path("/Users/jasonwillems/Repos/Media-Database"),
        help="Path to local Media-Database checkout (read-only).",
    )
    parser.add_argument(
        "--dest",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "sites" / "mediadatabase",
        help="Destination directory inside at1as.github.io.",
    )
    parser.add_argument("--movies", type=int, default=100)
    parser.add_argument("--series", type=int, default=25)
    parser.add_argument("--standup", type=int, default=15)
    args = parser.parse_args()

    source_root = args.source.resolve()
    dest_root = args.dest.resolve()
    dest_resources = dest_root / "resources"
    dest_output = dest_root / "output"

    # Import SiteGenerator directly from the source repo (read-only)
    sys.path.insert(0, str(source_root))
    import jinja2  # noqa: E402
    from src.site_generator import SiteGenerator  # noqa: E402

    movie_data = json.loads((source_root / "_data" / "movie_data.json").read_text(encoding="utf-8"))
    series_data = json.loads((source_root / "_data" / "series_data.json").read_text(encoding="utf-8"))
    standup_data = json.loads((source_root / "_data" / "standup_data.json").read_text(encoding="utf-8"))
    live_music_data = json.loads((source_root / "_data" / "live_music_data.json").read_text(encoding="utf-8"))

    saved_movies = select_curated(
        movie_data, source_root, "movies", "movie", args.movies, SiteGenerator._asset_is_renderable
    )
    saved_series = select_curated(
        series_data, source_root, "series", "series", args.series, SiteGenerator._asset_is_renderable
    )
    saved_standup = select_curated(
        standup_data, source_root, "standup", "standup", args.standup, SiteGenerator._asset_is_renderable
    )
    saved_live_music = select_curated(
        live_music_data, source_root, "live-music", "live_music", None, SiteGenerator._asset_is_renderable
    )

    counts = {
        "movies": len(saved_movies),
        "series": len(saved_series),
        "standup": len(saved_standup),
        "live_music": len(saved_live_music),
    }
    print(f"Selected curated sample: {counts}")

    # Rebuild destination cleanly
    if dest_resources.exists():
        shutil.rmtree(dest_resources)
    if dest_output.exists():
        shutil.rmtree(dest_output)

    # Copy latest _resources -> resources (excluding .DS_Store)
    shutil.copytree(
        source_root / "_resources",
        dest_resources,
        ignore=shutil.ignore_patterns(".DS_Store"),
    )

    for sub in ("movies", "series", "standup", "live-music"):
        (dest_output / sub).mkdir(parents=True, exist_ok=True)

    # Render using exact latest Jinja2 templates from source repo
    env = jinja2.Environment(loader=jinja2.FileSystemLoader([str(source_root / "_templates")]))
    env.filters["seasonnumber"] = SiteGenerator.season_filter
    env.filters["sanitize_title"] = SiteGenerator.sanitize_title_filter
    env.filters["format_number"] = SiteGenerator.format_number_filter
    env.filters["format_duration"] = SiteGenerator.format_duration_filter
    env.filters["content_rating_parts"] = SiteGenerator.content_rating_parts
    env.filters["imdb_title_url"] = SiteGenerator.imdb_title_url
    env.filters["imdb_trailer_url"] = SiteGenerator.imdb_trailer_url
    env.globals.update(
        number_of_movies=counts["movies"],
        number_of_live_music=counts["live_music"],
    )

    movie_index = env.get_template("index.html")
    series_index = env.get_template("series.html")
    standup_index = env.get_template("standup.html")
    about_tpl = env.get_template("about.html")
    movie_details = env.get_template("movie_details.html")
    series_details = env.get_template("series_details.html")
    standup_details = env.get_template("standup_details.html")

    # 1. Top-level pages
    top_pages = [
        (
            "index.html",
            movie_index.render(
                movie_list=saved_movies,
                number_of_series=counts["series"],
                number_of_standup=counts["standup"],
                live_music=False,
            ),
            "Movie & TV Database — Local Media Catalog Demo | Jason Willems",
            "Interactive demo of Media Database: browse a curated sample of movies, TV series, stand-up, and live concerts with IMDb ratings, poster tiles, and filters.",
            BASE_URL,
            "Movie &amp; TV Database — Sample Catalog",
            True,
            False,
        ),
        (
            "series.html",
            series_index.render(
                series_list=saved_series,
                number_of_movies=counts["movies"],
                number_of_standup=counts["standup"],
            ),
            "TV Series — Movie & TV Database Demo | Jason Willems",
            "Browse a curated sample of TV series in the Media Database demo, with IMDb ratings, seasons, episodes, poster tiles, and multi-field filters.",
            f"{BASE_URL}series.html",
            "TV Series — Movie &amp; TV Database Demo",
            False,
            False,
        ),
        (
            "standup.html",
            standup_index.render(
                standup_list=saved_standup,
                number_of_movies=counts["movies"],
                number_of_series=counts["series"],
            ),
            "Stand-Up Specials — Movie & TV Database Demo | Jason Willems",
            "Browse a curated sample of stand-up comedy specials in the Media Database demo, with IMDb ratings, trailers, poster tiles, and filters.",
            f"{BASE_URL}standup.html",
            "Stand-Up Specials — Movie &amp; TV Database Demo",
            False,
            False,
        ),
        (
            "live-music.html",
            movie_index.render(
                movie_list=saved_live_music,
                number_of_series=counts["series"],
                number_of_standup=counts["standup"],
                live_music=True,
            ),
            "Live Music Concerts — Movie & TV Database Demo | Jason Willems",
            "Browse live concert films in the Media Database demo, complete with artists, runtimes, IMDb ratings, poster tiles, and filters.",
            f"{BASE_URL}live-music.html",
            "Live Music Concerts — Movie &amp; TV Database Demo",
            False,
            False,
        ),
        (
            "about.html",
            about_tpl.render(
                number_of_movies=counts["movies"],
                number_of_series=counts["series"],
                number_of_standup=counts["standup"],
                time=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            ),
            "About — Movie & TV Database | Jason Willems",
            "About Media Database, an open-source Python tool that indexes local movie, TV, stand-up, and concert libraries into a searchable static catalog.",
            f"{BASE_URL}about.html",
            None,
            False,
            True,
        ),
    ]

    for filename, raw_html, title, desc, canon, sr_h1, with_ld, is_about in top_pages:
        seo = build_seo_head(
            title=title,
            description=desc,
            canonical_url=canon,
            include_jsonld=with_ld,
            counts=counts,
        )
        out_html = postprocess_html(
            raw_html,
            is_detail=False,
            page_title=title,
            sr_h1=sr_h1,
            seo_block=seo,
            is_about=is_about,
        )
        (dest_output / filename).write_text(out_html, encoding="utf-8")

    # 2. Detail pages (iframe modals)
    for item in saved_movies.values():
        fname = f"{SiteGenerator.sanitize_filename(item['title'])}({item['year']}).html"
        raw = movie_details.render(
            number_of_movies=counts["movies"],
            movie=item,
            number_of_series=counts["series"],
            number_of_standup=counts["standup"],
            location="",
            live_music=False,
        )
        (dest_output / "movies" / fname).write_text(postprocess_html(raw, is_detail=True), encoding="utf-8")

    for item in saved_series.values():
        fname = f"{SiteGenerator.sanitize_filename(item['title'])}({str(item['year'])[:4]}).html"
        raw = series_details.render(
            number_of_series=counts["series"],
            series=item,
            number_of_movies=counts["movies"],
            number_of_standup=counts["standup"],
        )
        (dest_output / "series" / fname).write_text(postprocess_html(raw, is_detail=True), encoding="utf-8")

    for item in saved_standup.values():
        fname = f"{SiteGenerator.sanitize_filename(item['title'])}({item['year']}).html"
        raw = standup_details.render(
            standup=item,
            number_of_movies=counts["movies"],
            number_of_series=counts["series"],
            number_of_standup=counts["standup"],
            location="",
        )
        (dest_output / "standup" / fname).write_text(postprocess_html(raw, is_detail=True), encoding="utf-8")

    for item in saved_live_music.values():
        fname = f"{SiteGenerator.sanitize_filename(item['title'])}({item['year']}).html"
        raw = movie_details.render(
            number_of_movies=counts["movies"],
            movie=item,
            number_of_series=counts["series"],
            number_of_standup=counts["standup"],
            location="",
            live_music=True,
        )
        (dest_output / "live-music" / fname).write_text(postprocess_html(raw, is_detail=True), encoding="utf-8")

    # 3. Transcode posters (read-only from source, writing compact JPEGs to destination)
    n_posters = 0
    n_posters += transcode_posters(saved_movies, source_root, dest_output, "movies", "movie")
    n_posters += transcode_posters(saved_series, source_root, dest_output, "series", "series")
    n_posters += transcode_posters(saved_standup, source_root, dest_output, "standup", "standup")
    n_posters += transcode_posters(saved_live_music, source_root, dest_output, "live-music", "live_music")
    print(f"Transcoded {n_posters} posters to compact JPEGs.")

    # 4. Build 1200x630 PNG social share card
    build_share_card(source_root, dest_output / "share-card.png")
    print(f"Generated share card: {dest_output / 'share-card.png'}")


if __name__ == "__main__":
    main()
