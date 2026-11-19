# Kudjoba Solutions — website

The corporate website for Kudjoba Solutions. It's a static site written in plain HTML, CSS and JavaScript. There's no framework, no build step and no runtime dependencies, so GitHub Pages serves it exactly as it is in the repository.

## Structure

```
index.html            Home page: hero, about + team, services, projects, approach, why us, contact
privacy.html          Privacy notice for the enquiry form
404.html              Not-found page (GitHub Pages serves it automatically)
robots.txt            Allows all crawlers
.nojekyll             Tells GitHub Pages to serve files as-is (no Jekyll processing)
favicon-32.png, apple-touch-icon.png
assets/
  css/main.css        Design tokens (light/dark), layout and components
  js/config.js        Site settings: form endpoint, fallback email  ← edit this
  js/main.js          Navigation, mobile drawer, reveal motion, tabs, dialogs, form
  fonts/              Lexend + Source Sans 3 (self-hosted, SIL Open Font License)
  img/                Optimised WebP/PNG images, logo, Open Graph image
images/, icons/       Original assets from the previous site (no longer referenced)
```

## Activating the enquiry form

GitHub Pages can't process form submissions by itself. Until a form service is connected, the form still checks what visitors type, but tells them plainly that online enquiries aren't active yet. It never pretends a message was sent.

To activate submissions with Formspree (it has a free tier):

1. Create a form at <https://formspree.io> and copy its endpoint, for example `https://formspree.io/f/abcdwxyz`.
2. Open `assets/js/config.js` and set `formEndpoint` to that URL.
3. Optionally, set `fallbackEmail` to a real business email address. It's shown as a mailto link if a submission fails.
4. Commit and push. Then send a test enquiry and confirm it reaches the Formspree inbox.

Any other service that accepts a multipart POST with `Accept: application/json` and returns a 2xx status on success also works.

## Deploying to GitHub Pages

The site deploys from the root of a branch. No workflow file is needed.

1. Merge the redesign into `main`.
2. On GitHub, go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`, and save.
3. The site will be live at `https://dev-lusale.github.io/UTS-Technologies-zm/` after a minute or two.

All page links and asset paths in `index.html` and `privacy.html` are relative, so the site works under the repository subpath and on a custom domain alike. `404.html` is the only exception. GitHub serves it at any missing URL depth, so it uses absolute paths beginning with `/UTS-Technologies-zm/`. If you rename the repository or add a custom domain, update those paths. With a custom domain, the prefix becomes `/`.

### Custom domain (optional)

Add a `CNAME` file containing the domain, configure DNS as described in the GitHub Pages docs, and update `404.html` as noted above. Once the domain is final, add `<link rel="canonical">`, an absolute `og:image` URL and a `sitemap.xml`. These were left out on purpose because no production domain has been confirmed yet.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

## Content still needed from the business

- Contact details: business email, phone and WhatsApp number (the old site had only a placeholder), plus physical address and social media profiles.
- Confirmation that the mission, vision and values text is approved.
- A higher-quality image or screenshot of TechMart's own interface (the old image showed a different brand's website, so it was removed).
- Any client work, testimonials or case studies you have permission to publish.
- Whether Team KUDJOBA member Musonda Mwape should appear in the team section (photo and role needed).
