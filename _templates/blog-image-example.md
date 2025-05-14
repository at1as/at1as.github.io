---
layout: blog
title: "Example Post with Images"
date: 2025-05-13 12:00:00 -0400
categories: [tutorial]
tags: [images, markdown, jekyll]
published: true
---

This is an example of how to include images in your blog posts. The first paragraph will automatically get special styling with a drop cap.

## Using Images in Blog Posts

Here's how to include an image in your post:

![Example image description](/assets/images/blog/2023/example-post/example-image.jpg)

You can also add styling to your images:

<img src="/assets/images/blog/2023/example-post/example-image.jpg" alt="Example image with styling" class="rounded shadow" style="max-width: 80%; margin: 0 auto; display: block;">

### Image Alignment

You can align images to the left, right, or center:

<div style="text-align: center;">
  <img src="/assets/images/blog/2023/example-post/example-image.jpg" alt="Centered image" style="max-width: 60%;">
  <figcaption>Image caption goes here</figcaption>
</div>

## Image Best Practices

1. **Optimize your images** before uploading them to keep your site fast
2. **Use descriptive filenames** to help with SEO and organization
3. **Always include alt text** for accessibility
4. **Organize images by post** in the assets directory

## Image Directory Structure

For this post, images would be stored in:
```
/assets/images/blog/2023/example-post/
```

This keeps your images organized and easy to manage as your blog grows.
