#!/usr/bin/env python3
"""Check the built sitemap against canonical HTML in registered static exports."""
import argparse
from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser
from xml.etree import ElementTree


class PageMetadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.in_title = False
        self.h1_count = 0
        self.canonicals = []
        self.meta = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.h1_count += 1
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs.get("href", ""))
        if tag == "meta":
            key = attrs.get("name", attrs.get("property", "")).lower()
            self.meta.setdefault(key, []).append(attrs.get("content", ""))

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, text):
        if self.in_title:
            self.title += text

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
            head = PageMetadata()
            head.feed(file.read_text())
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
            for key in ["og:title", "og:description", "og:image", "twitter:title", "twitter:description", "twitter:image"]:
                require(bool(head.value(key)), f"Missing {key}: {route}")
            require(head.value("twitter:card") == "summary_large_image", f"Missing large social card: {route}")
            for key in ["og:image", "twitter:image"]:
                image = urlsplit(head.value(key))
                require(f"{image.scheme}://{image.netloc}" == origin and
                        (site_dir / image.path.lstrip("/")).is_file(),
                        f"Missing production social image: {route}")
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
    print(f"SEO checks passed: {len(urls)} sitemap URLs; {total} exported public pages; no error, redirect, query or asset entries for these apps.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site-dir", type=Path, default=Path("_site"))
    check(parser.parse_args().site_dir)
