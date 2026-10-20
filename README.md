# Jason Willems - Personal Website

Personal website hosted at [jasonwillems.com](https://www.jasonwillems.com) and [at1as.github.io](https://at1as.github.io).

This site is built with [Jekyll](https://jekyllrb.com/) and hosted on GitHub Pages.

## Features

- Responsive design for all device sizes
- Interactive travel map showing countries visited and lived in
- Talks section for presentations and speaking engagements
- Blog with Markdown support for easy content creation

## Local Development

### Prerequisites

- Ruby (version 2.6.0 or higher recommended)
- RubyGems
- Bundler

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/at1as/at1as.github.io.git
   cd at1as.github.io
   ```

2. Install dependencies
   ```bash
   bundle config set --local path vendor/bundle
   bundle install
   ```

### Running the site locally

1. Start the Jekyll server
   ```bash
   make serve
   ```

2. Open your browser and navigate to http://localhost:4000

3. The `--livereload` option will automatically refresh the page when you make changes to the source files

### Troubleshooting

If an old local lockfile tries to load Bundler 1.17 and fails with an
`undefined method 'untaint'` error, update its Bundler version:

```bash
BUNDLE_VERSION=system bundle update --bundler
```

The Gemfile explicitly includes libraries that newer Ruby versions no longer
ship by default. Run `bundle install` after changing Ruby versions. `make serve`
also sets Ruby's external encoding to UTF-8 so non-ASCII filenames work even
when the shell's locale is not recognized.

If you encounter issues with the FFI gem, try:

```bash
# Configure FFI to use system libffi
bundle config build.ffi --enable-system-libffi
bundle update ffi
```

## Creating Content

### Blog Posts

Create new blog posts in the `_posts` directory with the format `YYYY-MM-DD-title.md`. Each post should include front matter:

```yaml
---
layout: post
title: "Your Post Title"
date: YYYY-MM-DD HH:MM:SS -0400
categories: [category1, category2]
tags: [tag1, tag2]
---

Your post content in Markdown format.
```

### Talks

Add new talks directly to the `talks.html` file or create a collection in the `_talks` directory.

## Kurzweil Scorecard

`sites/kurzweil/` is a generated static copy of the [Kurzweil Scorecard](https://github.com/at1as/kurzweil-scorecard). That repository is the source of truth for the application, research and export tooling; this directory is not a submodule.

To update it, commit changes in the source repository, run its `npm run export:site` and `npm run test:export`, then use `npm run export:copy -- --write` from that source checkout. Follow its [export guide](https://github.com/at1as/kurzweil-scorecard/blob/main/docs/STATIC_EXPORT.md) for the full verification and copy process. Do not edit the generated files here. The export manifest protects against replacing a locally edited copy.

Review the export and `sites/index.html` link on a dedicated branch, record the source commit SHA in the hosting commit message, and build this Jekyll site before pushing. Include only the intended site files, leaving unrelated local work out of the commit.

## Analytics in exported sites

Kurzweil Scorecard and What If I Joined include the `G-Q5N6H3PVG2` tag in their
source-app layouts. Their exports load it only at their production URLs on
`www.jasonwillems.com`; local previews remain untracked. Enhanced Measurement remains
enabled on the shared stream and handles client navigation. Calculator values are
not added to analytics or URLs. Do not inject another tag or SPA page-view handler
here: edit the corresponding source repo and re-export the generated files.

## Sitemap and search metadata

The root `sitemap.xml` includes Jekyll content plus canonical directory-index pages
from the static apps registered in `_data/static_sitemaps.json`. New prediction pages
are picked up on each Jekyll build, including future copied exports. Exclude redirects
and error pages in that configuration. Do not list filtered URLs, evidence JSON,
research downloads, Next route payloads or asset files. Keep generated app files intact.

Build with `JEKYLL_ENV=production bundle exec jekyll build`, then run `make check-seo`.
Python 3.9+ is the only extra requirement; the checker uses the standard library. CI runs
it before publishing. It checks coverage, duplicate URLs, canonical agreement, robots,
headings, distinct titles/descriptions and crawler-visible social metadata for both apps.
No build timestamps are added as `lastmod`; only actual content dates should be used.

Edit app metadata in its source repo and re-export. `robots.txt` advertises the sitemap
and permits scripts/styles needed for rendering. Search Console is the place to check
Google's crawl/indexing status; deployment and a valid sitemap do not prove indexing.

## Deployment

The Pages workflow builds and deploys on pushes to `master`. Push a reviewed change branch and merge it into `master` to publish; pushing the branch alone does not deploy the site.
