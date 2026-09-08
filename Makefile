.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@echo "  serve  - Start the Jekyll development server with live reload"

serve:
	bundle exec ruby -E UTF-8 -S jekyll serve --livereload

.PHONY: help serve
