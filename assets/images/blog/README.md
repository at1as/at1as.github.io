# Blog Images

This directory contains images used in blog posts. Images are organized by year and post name for easy management.

## Directory Structure

```
/assets/images/blog/
  /2023/
    /my-first-post/
      image1.jpg
      image2.png
    /another-post/
      featured.jpg
      diagram.svg
  /2024/
    /new-post/
      ...
```

## Usage in Markdown

Reference images in your blog posts using relative paths:

```markdown
![Image description](/assets/images/blog/2023/my-first-post/image1.jpg)
```

## Image Guidelines

- Use descriptive filenames (e.g., `react-component-diagram.png` instead of `img1.png`)
- Optimize images before uploading (compress JPGs and PNGs)
- Use appropriate formats:
  - JPG for photos
  - PNG for screenshots and graphics with transparency
  - SVG for vector graphics and icons
  - WebP for better compression (with JPG/PNG fallbacks)
- Include alt text for accessibility
```
