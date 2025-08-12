# Portfolio Website

A modern, responsive portfolio website built with Astro, Vue.js, and Tailwind CSS. Features project showcases, integrated CV viewer, smooth animations, and optimized performance.

## 🚀 Project Structure

```text
/
├── public/
│   ├── cv/                    # CV files (PDF format)
│   ├── images/
│   │   └── projects/          # Project thumbnail images
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   ├── cv/               # Alternative CV location
│   │   └── images/           # Optimized images
│   ├── components/
│   │   ├── layout/           # Header, footer components
│   │   ├── sections/         # Main page sections
│   │   └── ui/               # Reusable UI components
│   ├── content/
│   │   ├── projects/         # Project markdown files
│   │   └── config.ts         # Content collections schema
│   ├── layouts/
│   │   └── BaseLayout.astro  # Main page layout
│   ├── pages/
│   │   └── index.astro       # Homepage
│   ├── styles/               # Global CSS and components
│   └── utils/                # Helper functions
└── package.json
```

## 📝 Customizing Your Portfolio

### Adding Your CV

1. **PDF Format**: Place your CV file in `public/cv/` directory
   ```
   public/cv/your-cv.pdf
   ```

2. **Update CV Reference**: The CV viewer component automatically looks for files in the `/cv/` directory. The default file is `sample-cv.pdf` - replace it with your own or update the reference in the CV viewer component.

### Adding Projects

1. **Create Project File**: Add a new markdown file in `src/content/projects/`
   ```
   src/content/projects/your-project.md
   ```

2. **Project Structure**: Each project file should follow this format:
   ```markdown
   ---
   title: "Your Project Title"
   description: "Brief description of your project"
   technologies: ["React", "Node.js", "MongoDB"]
   thumbnail: "/images/projects/your-project-thumbnail.jpg"
   featured: true                    # Show on homepage
   order: 1                         # Display order (lower = first)
   links:
     main: "https://your-project.com"
     github: "https://github.com/you/project"
     additional: "https://docs.project.com"
   publishDate: 2024-01-15
   ---

   # Project Details

   Write your detailed project description here using markdown.
   
   ## Features
   - Feature 1
   - Feature 2
   
   ## Technical Details
   Explain implementation details, challenges solved, etc.
   ```

3. **Required Fields**:
   - `title`: Project name
   - `description`: Short summary (used in cards)
   - `technologies`: Array of tech stack items
   - `thumbnail`: Path to project image
   - `publishDate`: Project completion/publish date

4. **Optional Fields**:
   - `featured`: Set to `true` to display on homepage
   - `order`: Number for display order (lower numbers first)
   - `links`: Object with `main`, `github`, and `additional` URLs

### Adding Project Images

1. **Image Location**: Place project thumbnails in `public/images/projects/`
   ```
   public/images/projects/
   ├── project1-thumbnail.jpg
   ├── project2-thumbnail.jpg
   └── your-project-thumbnail.jpg
   ```

2. **Image Requirements**:
   - Recommended size: 800x600px or 16:9 aspect ratio
   - Formats: JPG, PNG, WebP, or AVIF
   - Optimized file size (< 500KB recommended)

3. **Reference in Project**: Use the path starting with `/images/projects/`
   ```yaml
   thumbnail: "/images/projects/your-project-thumbnail.jpg"
   ```

### Customizing Profile Section

1. **Profile Image**: Add your photo to `public/images/` or `src/assets/images/profile/`

2. **Update Profile Content**: Edit the profile section in `src/components/sections/ProfileSection.astro`

3. **Personal Information**: Update contact details, bio, and social links in the profile component

### Customizing Styles

1. **Global Styles**: Edit `src/styles/global.css` for site-wide styling

2. **Component Styles**: Individual component styles are in `src/styles/components/`

3. **Responsive Design**: Modify `src/styles/responsive.css` for mobile/tablet layouts

4. **Colors & Theme**: Update Tailwind configuration or CSS custom properties in global styles

### Site Configuration

1. **SEO Settings**: Update meta tags, site title, and description in `src/layouts/BaseLayout.astro`

2. **Site URL**: Configure your domain in `astro.config.mjs` for sitemap generation

3. **Social Media**: Update Open Graph images and social media links

### Content Management Tips

- **Project Order**: Use the `order` field to control display sequence
- **Featured Projects**: Set `featured: true` for homepage display
- **Technology Tags**: Keep technology names consistent across projects
- **Image Optimization**: The build process automatically optimizes images
- **Content Validation**: The schema in `src/content/config.ts` validates all project data

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
