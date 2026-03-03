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

      file_path = if page.respond_to?(:path)
        page.path
      elsif page.respond_to?(:[])
        page["path"]
      end

      content = if page.respond_to?(:content)
        page.content
      elsif page.respond_to?(:[])
        page["content"]
      end

      if file_path && !file_path.empty?
        site_source = @context&.registers&.dig(:site)&.source
        file_path = File.join(site_source, file_path) if site_source && !File.exist?(file_path)

        if File.exist?(file_path)
          content = File.read(file_path)
        end
      end

      return "0" if content.nil? || content.empty?

      content = content.gsub(/^---.*?---/m, '')
      words = content.gsub(/<[^>]*>/, '').split(/\s+/).size
      (words / 225.0).ceil.to_s
    end
  end
end

Liquid::Template.register_filter(Jekyll::ReadingTimeFilter)
