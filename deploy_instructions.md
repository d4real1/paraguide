# Deploy ParaGuide for free

## Option 1: GitHub Pages (recommended)

1. Create a free account at [github.com](https://github.com)
2. Click **New repository** → name it **`paraguide`** (no hyphens at start/end; valid: letters only)
   - ✅ Good: `paraguide`, `para-guide`
   - ❌ Invalid: `-paraguide-`, `paraguide-`, `-paraguide`
3. Make it **public**
4. Upload the three files:
   - `index.html`
   - `parasite_data.js`
   - (optionally this README)
5. Go to repository **Settings** → **Pages** → under "Branch" select `main` → save
6. Your site will be live at: `https://YOURUSERNAME.github.io/paraguide`

Updates: just edit files on GitHub; site refreshes in 1-2 minutes.

## Option 2: Netlify (drag & drop)

1. Go to [netlify.com](https://netlify.com) → sign up with GitHub or email
2. Drag the folder containing `index.html` and `parasite_data.js` onto the Netlify dashboard
3. Site is instantly live at a random name like `random-name.netlify.app`
4. You can rename it in site settings.

## Testing locally (no internet needed)

- Download the two files (`index.html`, `parasite_data.js`) into the same folder.
- Double-click `index.html` – it runs in your browser offline.

## Custom domain (optional)

- Both GitHub Pages and Netlify allow adding a custom domain for free (you pay for the domain name separately, ~$10/year).

## Important notes

- The app is fully client‑side – no server, no database costs.
- All data is in `parasite_data.js` – you can edit it anytime to add/update parasites.
- The disclaimer is embedded; do not remove it.
