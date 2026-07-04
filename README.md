# Kayrali

Marketing website for Kayrali, a boutique offering affordable, premium
ready-made sarees, lehengas, and curated ethnic wear (including modest,
Muslim-friendly styles).

This is a static site — plain HTML/CSS/JS, no build step required.

## Structure

```
index.html        Single-page site (Home, About, Collections, Why Kayrali, Contact)
css/style.css      Styles (brand colors pulled from the logos)
js/script.js       Mobile nav toggle, footer year, contact form handling
images/            Logos + generated favicons
```

## Local preview

Just open `index.html` in a browser, or serve the folder locally:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Push to GitHub

```
git init
git add .
git commit -m "Initial Kayrali website"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Deploy on Cloudflare Pages

1. Go to the Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select this GitHub repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** (leave empty)
   - **Build output directory:** `/`
4. Deploy. Cloudflare will auto-redeploy on every push to `main`.

## Things to fill in before launch

- Replace the placeholder store address, phone number, and email in the
  **Contact** section (`index.html`).
- Replace the `#` social links (Instagram / Facebook / WhatsApp) with real URLs.
- The contact form is currently static (no backend). Wire it up to a service
  like [Formspree](https://formspree.io) or a Cloudflare Pages Function
  before relying on it to receive messages.
- Swap the colored placeholder blocks in the **Collections** section for
  real product/store photography when available.
