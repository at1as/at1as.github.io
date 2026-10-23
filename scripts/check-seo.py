#!/usr/bin/env python3
"""Check main-site and registered static-app SEO against the built sitemap."""
import argparse
from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urljoin, urlsplit
from urllib.robotparser import RobotFileParser
from xml.etree import ElementTree


class PageMetadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.in_title = False
        self.in_head = False
        self.tag_counts = Counter()
        self.language = ""
        self.h1_count = 0
        self.canonicals = []
        self.meta = {}
        self.links = []
        self.jsonld = []
        self.in_jsonld = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("html", "head", "body"):
            self.tag_counts[tag] += 1
        if tag == "html":
            self.language = attrs.get("lang", "")
        if tag == "head":
            self.in_head = True
        if tag == "title" and self.in_head:
            self.in_title = True
            self.tag_counts["title"] += 1
        if tag == "h1":
            self.h1_count += 1
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        if self.in_head and tag == "link" and "canonical" in attrs.get("rel", "").split():
            self.canonicals.append(attrs.get("href", ""))
        if self.in_head and tag == "meta":
            key = attrs.get("name", attrs.get("property", "")).lower()
            self.meta.setdefault(key, []).append(attrs.get("content", ""))
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.in_jsonld = True
            self.jsonld.append("")

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "head":
            self.in_head = False
        if tag == "script":
            self.in_jsonld = False

    def handle_data(self, text):
        if self.in_title:
            self.title += text
        if self.in_jsonld:
            self.jsonld[-1] += text

    def value(self, key):
        values = self.meta.get(key, [])
        return values[0] if len(values) == 1 else ""



def crawl_allowed(robots, url):
    # Google uses the most specific matching rule; stdlib can_fetch uses first match.
    entry = next((entry for entry in robots.entries if entry.applies_to("Googlebot")),
                 robots.default_entry)
    if entry is None:
        return robots.can_fetch("Googlebot", url)
    path = urlsplit(url).path
    matches = [(len(rule.path), rule.allowance) for rule in entry.rulelines
               if rule.applies_to(path)]
    return not matches or max(matches)[1]


def check(site_dir):
    root = Path(__file__).resolve().parent.parent
    config = json.loads((root / "_data/static_sitemaps.json").read_text())
    site_dir = site_dir.resolve()
    errors = []
    checked_images = set()

    def require(condition, message):
        if not condition:
            errors.append(message)

    robots_text = (site_dir / "robots.txt").read_text()
    advertised = [line.split(":", 1)[1].strip() for line in robots_text.splitlines()
                  if line.lower().startswith("sitemap:")]
    require(len(advertised) == 1, "robots.txt must advertise one root sitemap")
    parsed = urlsplit(advertised[0] if advertised else "")
    origin = f"{parsed.scheme}://{parsed.netloc}"
    require(parsed.scheme == "https" and parsed.path == "/sitemap.xml",
            "Advertise the production HTTPS sitemap")
    robots = RobotFileParser()
    robots.parse(robots_text.splitlines())

    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap = ElementTree.parse(site_dir / "sitemap.xml").getroot()
    urls = [node.text for node in sitemap.findall("sm:url/sm:loc", namespace)]
    require(bool(urls), "The root sitemap is empty")
    duplicate_urls = [url for url, count in Counter(urls).items() if count > 1]
    require(not duplicate_urls, f"Duplicate sitemap URLs: {duplicate_urls}")
    for url in urls:
        parsed = urlsplit(url or "")
        require(f"{parsed.scheme}://{parsed.netloc}" == origin and not parsed.query
                and not parsed.fragment, f"Non-canonical sitemap URL: {url}")
    listed = set(urls)
    metadata = {}

    def read_page(file):
        if file not in metadata:
            head = PageMetadata()
            head.feed(file.read_text(encoding="utf-8"))
            metadata[file] = head
        return metadata[file]

    def indexable(head):
        return not any("noindex" in value.lower()
                       for key in ("robots", "googlebot")
                       for value in head.meta.get(key, []))

    # Every sitemap entry must resolve to crawlable HTML with metadata in its head.
    for url in urls:
        route = urlsplit(url).path
        file = site_dir / unquote(route).lstrip("/")
        if route.endswith("/"):
            file /= "index.html"
        require(file.is_file() and file.suffix == ".html", f"Sitemap target is not HTML: {route}")
        if not file.is_file() or file.suffix != ".html":
            continue
        head = read_page(file)
        require(head.canonicals == [url], f"Missing, duplicate or non-self canonical: {route}")
        require(head.tag_counts == Counter(html=1, head=1, body=1, title=1),
                f"Missing or nested document/title elements: {route}")
        require(bool(head.language), f"Missing document language: {route}")
        require(bool(head.value("viewport")), f"Missing viewport: {route}")
        require(head.title.strip() and head.h1_count == 1, f"Missing title or single H1: {route}")
        require(bool(head.value("description")), f"Missing/duplicate description: {route}")
        require(indexable(head), f"Indexable sitemap page has noindex: {route}")
        require(crawl_allowed(robots, url), f"robots.txt blocks {route}")
        require(head.value("og:url") == url, f"Open Graph URL differs from canonical: {route}")

    # Discover Jekyll pages, including hidden/error pages omitted from the sitemap.
    # Generated app exports have their own source repositories and stricter checks below.
    main_titles, main_descriptions = [], []
    main_total = 0
    app_prefixes = tuple(app["root"] for app in config)
    for file in sorted(site_dir.rglob("*.html")):
        route = "/" + file.relative_to(site_dir).as_posix()
        if route.startswith(app_prefixes):
            continue
        if "<!-- Begin Jekyll SEO tag" not in file.read_text(encoding="utf-8"):
            continue
        route = route.removesuffix("index.html") if route.endswith("/index.html") else route
        head = read_page(file)
        url = origin + route
        if not indexable(head):
            require(url not in listed, f"Hidden/error/unfinished page in sitemap: {route}")
            continue
        require(url in listed, f"Main-site page missing from sitemap: {route}")
        main_total += 1
        main_titles.append(head.title.strip())
        # Pagination shares the archive summary but has its own title and canonical.
        if not re.fullmatch(r"/blog/page\d+/", route):
            main_descriptions.append(head.value("description"))
        # This is an editorial budget, not a Google snippet-length requirement.
        require(0 < len(head.value("description")) <= 180, f"Use a concise page description: {route}")
        for key in ["og:title", "og:description", "og:image", "og:image:alt",
                    "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"]:
            require(bool(head.value(key)), f"Missing {key}: {route}")
        for key in ["og:image", "twitter:image"]:
            image = urlsplit(head.value(key))
            require(f"{image.scheme}://{image.netloc}" == origin
                    and (site_dir / unquote(image.path).lstrip("/")).is_file(),
                    f"Missing production social image: {route}")
        schemas = []
        require(bool(head.jsonld), f"Missing structured data: {route}")
        for raw in head.jsonld:
            try:
                schemas.append(json.loads(raw))
            except json.JSONDecodeError:
                require(False, f"Invalid JSON-LD: {route}")
        if head.value("og:type") == "article":
            types = {schema.get("@type") for schema in schemas if isinstance(schema, dict)}
            require("BlogPosting" in types, f"Missing article schema: {route}")
            breadcrumbs = [s for s in schemas if isinstance(s, dict)
                           and s.get("@type") == "BreadcrumbList"]
            require(len(breadcrumbs) == 1, f"Missing/duplicate breadcrumb schema: {route}")
            if len(breadcrumbs) == 1:
                items = breadcrumbs[0].get("itemListElement", [])
                require([item.get("item") for item in items] ==
                        [origin + "/", origin + "/blog/", url],
                        f"Breadcrumb URLs differ from canonical hierarchy: {route}")
        for href in head.links:
            target = urlsplit(urljoin(url, href))
            if f"{target.scheme}://{target.netloc}" != origin:
                continue
            path = site_dir / unquote(target.path).lstrip("/")
            require(path.is_file() or (path / "index.html").is_file(),
                    f"Broken internal link from {route}: {href}")
    require(main_total > 0, "No main-site pages found")
    require(len(main_titles) == len(set(main_titles)), "Duplicate main-site page titles")
    require(len(main_descriptions) == len(set(main_descriptions)), "Duplicate main-site descriptions")
    print(f"Main site: {main_total} canonical public pages checked")

    total = 0
    for app in config:
        prefix = app["root"]
        require(prefix.startswith("/sites/") and prefix.endswith("/"),
                f"Invalid static-app root: {prefix}")
        app_root = site_dir / prefix.lstrip("/")
        require(app_root.is_dir(), f"Missing exported app: {prefix}")
        expected = set()
        descriptions, titles = [], []
        for file in sorted(app_root.rglob("index.html")):
            route = "/" + file.relative_to(site_dir).as_posix().removesuffix("index.html")
            url = origin + route
            head = read_page(file)
            if route in app["exclude"]:
                require(url not in listed, f"Excluded/error/redirect URL in sitemap: {url}")
                continue
            expected.add(url)
            require(head.canonicals == [url], f"Missing, duplicate or non-self canonical: {route}")
            require(head.title.strip() and head.h1_count == 1, f"Missing title or single H1: {route}")
            require(bool(head.value("description")), f"Missing/duplicate description: {route}")
            require(not any("noindex" in value.lower() for value in head.meta.get("robots", [])),
                    f"Indexable sitemap page has noindex: {route}")
            require(crawl_allowed(robots, url), f"robots.txt blocks {route}")
            require(head.value("og:url") == url, f"Open Graph URL differs from canonical: {route}")
            for key in ["og:title", "og:description", "og:image", "og:image:alt", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"]:
                require(bool(head.value(key)), f"Missing {key}: {route}")
            require(head.value("twitter:card") == "summary_large_image", f"Missing large social card: {route}")
            for key in ["og:image", "twitter:image"]:
                image = urlsplit(head.value(key))
                image_file = site_dir / image.path.lstrip("/")
                require(f"{image.scheme}://{image.netloc}" == origin and
                        image_file.is_file(),
                        f"Missing production social image: {route}")
                require(robots.can_fetch("Twitterbot", head.value(key)),
                        f"Social image blocked for Twitterbot: {route}")
                if image_file.is_file() and image_file not in checked_images:
                    checked_images.add(image_file)
                    content = image_file.read_bytes()
                    png = content.startswith(b"\x89PNG\r\n\x1a\n") and content[12:16] == b"IHDR"
                    require(png, f"Social image must be a real PNG: {image.path}")
                    require(len(content) < 5_000_000, f"Social image exceeds 5 MB: {image.path}")
                    if png:
                        dimensions = (int.from_bytes(content[16:20], "big"), int.from_bytes(content[20:24], "big"))
                        require(dimensions == (1200, 630), f"Social image must be 1200×630: {image.path}")
            titles.append(head.title.strip())
            descriptions.append(head.value("description"))
        actual = {url for url in listed if url and url.startswith(origin + prefix)}
        require(expected == actual, f"Sitemap coverage mismatch for {prefix}: missing={sorted(expected-actual)}, extra={sorted(actual-expected)}")
        require(len(titles) == len(set(titles)), f"Duplicate page titles in {prefix}")
        require(len(descriptions) == len(set(descriptions)), f"Duplicate descriptions in {prefix}")
        require(bool(expected), f"No indexable pages found in {prefix}")
        total += len(expected)
        print(f"{prefix}: {len(expected)} canonical public pages checked")
    # Crawlers need the same scripts and styles as visitors.
    for resource in ["/assets/js/main.js", "/assets/css/main.css", "/sites/kurzweil/_next/static/example.js", "/sites/what-if-i-joined/_next/static/example.js"]:
        require(crawl_allowed(robots, origin + resource), f"Rendering resource blocked: {resource}")
    if errors:
        raise SystemExit("SEO check failed:\n- " + "\n- ".join(errors))
    print(f"SEO checks passed: {len(urls)} sitemap URLs; {main_total} main-site pages; {total} exported public pages.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site-dir", type=Path, default=Path("_site"))
    check(parser.parse_args().site_dir)
