.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@echo "  serve     - Start the Jekyll development server with live reload"
	@echo "  check-seo - Check the built sitemap and exported-page metadata"

serve:
	bundle exec ruby -E UTF-8 -S jekyll serve --livereload

check-seo:
	python3 scripts/check-seo.py --site-dir _site

.PHONY: help serve check-seo
