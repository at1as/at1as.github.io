module Jekyll
  module ReadingTimeFilter
    def reading_time(input)
      return "0" if input.nil? || input.empty?

      # Simple word count
      words = input.gsub(/<[^>]*>/, '').split(/\s+/).size
      (words / 225.0).ceil.to_s
    end

    def reading_time_from_file(page)
      return "0" if page.nil?

      if page.is_a?(String)
        return reading_time(page)
      end

      # Use the page's processed content, don't read raw file
      content = if page.respond_to?(:content)
        page.content
      elsif page.respond_to?(:[])
        page["content"]
      else
        return "0"
      end

      return "0" if content.nil? || content.empty?

      # Remove front matter if present
      content = content.gsub(/^---.*?---/m, '')
      words = content.gsub(/<[^>]*>/, '').split(/\s+/).size
      (words / 225.0).ceil.to_s
    end
  end
end

Liquid::Template.register_filter(Jekyll::ReadingTimeFilter)
