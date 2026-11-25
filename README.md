# Chalant Central — website

Static site with no build step. To preview it, open `index.html` in a browser. To publish it, upload these files to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages), then point `chalantcentral.com` at it.

```
index.html        page markup (all sections)
css/style.css     styles
js/main.js        nav, animations, lightbox, quote form
favicon-32.png, apple-touch-icon.png   browser-tab and phone home-screen icons (made from the logo)
images/           web-optimised photos (originals stay in Assets/Images)
```

## Sending quote form emails to chalantcentral@gmail.com (Formspree)

1. Sign up at https://formspree.io using **chalantcentral@gmail.com**, then confirm the verification email.
2. Click **+ New Form**, name it "Catering Quotes" and set the target email to chalantcentral@gmail.com.
3. Formspree shows an endpoint such as `https://formspree.io/f/abcdwxyz`. Copy the ID at the end (`abcdwxyz`).
4. In `index.html`, search for `YOUR_FORM_ID` and replace it with your ID:
   `action="https://formspree.io/f/abcdwxyz"`
5. Publish the site, send a test request and check the inbox (and spam folder the first time).
6. Optional: in Formspree → Settings, add `chalantcentral.com` under allowed domains.

The free plan includes 50 submissions a month.

**Fallback:** if the form ID is not set yet, or Formspree can't be reached, the form opens the visitor's own email app with a pre-filled message to chalantcentral@gmail.com instead.

## Still to do
- Social links: replace the three `href="#"` links in the footer with your Instagram, TikTok and Facebook URLs.
