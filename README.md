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

## Deployment

The site is automatically deployed when changes are pushed to the main branch of the GitHub repository.

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

GitHub Pages will build and deploy the site automatically.
