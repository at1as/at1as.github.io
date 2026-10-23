"""Regression tests for crawler-visible metadata parsing."""
import importlib.util
from pathlib import Path
import unittest


spec = importlib.util.spec_from_file_location(
    "check_seo", Path(__file__).with_name("check-seo.py")
)
seo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(seo)


class PageMetadataTests(unittest.TestCase):
    def parse(self, head, body=""):
        page = seo.PageMetadata()
        page.feed(f'<html lang="en"><head>{head}</head><body>{body}</body></html>')
        return page

    def test_combined_twitter_and_open_graph_description(self):
        # jekyll-seo-tag 2.9.1 emits both identifiers on one meta element.
        page = self.parse(
            '<meta name="twitter:description" property="og:description" '
            'content="AI &amp; software" />'
        )
        self.assertEqual(page.value("twitter:description"), "AI & software")
        self.assertEqual(page.value("og:description"), "AI & software")

    def test_separate_legacy_description_tags(self):
        page = self.parse(
            '<meta property="og:description" content="Summary">'
            '<meta name="twitter:description" content="Summary">'
        )
        self.assertEqual(page.value("og:description"), "Summary")
        self.assertEqual(page.value("twitter:description"), "Summary")

    def test_same_identifier_on_one_element_is_counted_once(self):
        page = self.parse(
            '<meta name="DESCRIPTION" property="description" content="Summary">'
        )
        self.assertEqual(page.value("description"), "Summary")

    def test_extra_twitter_description_is_still_rejected(self):
        page = self.parse(
            '<meta name="twitter:description" property="og:description" content="Summary">'
            '<meta name="twitter:description" content="Summary">'
        )
        self.assertEqual(page.value("twitter:description"), "")
        self.assertEqual(len(page.meta["twitter:description"]), 2)
        self.assertEqual(page.value("og:description"), "Summary")

    def test_body_metadata_and_svg_titles_do_not_change_head(self):
        page = self.parse(
            '<title>Page title</title><meta name="description" content="Summary">',
            '<meta name="description" content="Body example">'
            '<svg><title>Chart annotation</title></svg>',
        )
        self.assertEqual(page.title, "Page title")
        self.assertEqual(page.tag_counts["title"], 1)
        self.assertEqual(page.value("description"), "Summary")


if __name__ == "__main__":
    unittest.main()
