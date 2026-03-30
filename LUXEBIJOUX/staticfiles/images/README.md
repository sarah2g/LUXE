# static/images

This folder is the canonical place for site images used by templates and CSS.

Guidelines
- Put product images, icons, banners, and other site assets here.
- Use descriptive, lowercase filenames with dashes, e.g. `ring-gold-1.jpg`.
- Recommended formats: WebP (preferred), JPEG (photography), PNG (icons/transparent). Keep sizes reasonable.
- Recommended sizes:
  - product thumbnails: 400×300 or 800×600 for high-res
  - hero/banner images: 1600×600
  - icons: 64×64 or SVG (preferred for icons)
- If you add images to version control, keep them optimized (use a build step or tools like `imagemin` or `jpegoptim`).

How to reference in templates

Use Django static tag:

```django
<img src="{% static 'images/ring-gold-1.jpg' %}" alt="Gold ring">
```

For CSS background images:

```css
.hero-banner{background-image: url("{% static 'images/hero-collection.jpg' %}");}
```

Accessibility
- Always add appropriate `alt` text for images in templates.

License & ownership
- Keep original source/license info nearby (e.g., a text file or commit message) if images are third-party.
