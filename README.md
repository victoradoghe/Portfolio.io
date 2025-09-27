## Victor Adoghe — Portfolio (HTML/CSS/JS)

A modern single‑page portfolio with case studies. No frameworks required.

### Quick start
- Open `index.html` in a browser.
- Replace `assets/Victor_Adoghe_Resume.pdf` with your resume.

### Structure
```
/assets
  /icons
  /previews
  favicon.svg
  hero-bg.svg
  og-image-template.svg
/case-studies
  tictactoe.html
  donemate.html
  insight-dashboard.html
index.html
styles.css
script.js
```

### Design tokens (Tailwind-ready)
- Colors: `--accent #7A5CFF`, dark `--bg #0B1220`, light `#F8FAFC`, text `#E6E9F2/#0B1220`, muted `#95A0B4/#4B5563`
- Radius: `--radius 14px`  Shadow: `--shadow`  Spacing: `--space-*`
- Fonts: Inter (sans), Fira Code (mono)

### Breakpoints
- 640px, 900px, 1200px; container max 1200px; gutters 1rem

### Accessibility
- `aria-pressed`, `aria-expanded`, focus-visible, Esc to close modal, reduced-motion toggle

### Performance & SEO
- Lazy-load images; preconnect Google Fonts; OG tags; JSON-LD Person; deploy on Vercel/Netlify

### React project suggestion
```
src/
  components/
  pages/
  styles/
  assets/
```

Export previews from `assets/previews/*.svg` to PNG for mockups.

