# PATO — Watch Store Website

A stylish single-page watch store website with a built-in theme switcher (5 themes).

## Live on GitHub Pages

Once deployed, your site will be available at:

```
https://<your-github-username>.github.io/pato-watches/
```

## How to publish (2 minutes)

### Option A — Push via the GitHub website (no terminal needed)

1. Go to https://github.com/new and create a **public** repository named `pato-watches`.
2. Upload these files to the repo root: `index.html`, `style.css`, `script.js`, `.nojekyll`, `README.md`.
3. On the repo page click **Settings → Pages**.
4. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` / `/ (root)`
   - Click **Save**.
5. Wait ~1 minute, then open the URL shown (like `https://<username>.github.io/pato-watches/`).

### Option B — Push from your terminal

Run these commands from this project folder:

```bash
git checkout main
git add .
git commit -m "PATO watch store with theme switcher"
git remote add origin https://github.com/<your-username>/pato-watches.git
git push -u origin main
```

Then enable Pages: **Repo Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure + theme switcher UI |
| `style.css` | All styles + 5 themes via CSS variables (`[data-theme]`) |
| `script.js` | Theme switching with localStorage persistence |
| `.nojekyll` | Tells GitHub Pages to serve files as-is (skip Jekyll processing) |

## Local preview

Just open `index.html` in a browser, or run:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000
