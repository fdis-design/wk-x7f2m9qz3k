# Workout Tracker

Personal React/PWA workout tracker prepared for GitHub Pages and iPhone Home Screen installation.

## Important privacy note

This project uses a random-looking repository/site name, `robots.txt`, and `noindex` metadata to reduce discoverability. That is **obscurity, not authentication**: anyone who knows the URL can open the app.

Workout history is stored in the browser's `localStorage` on the device. It is not synced to GitHub and will not automatically appear on another device.

## GitHub Pages setup

1. Create a GitHub repository with a hard-to-guess name, for example:
   `wk-x7f2m9qz3k`
2. Upload/push this project to the `main` branch.
3. In the repository, open **Settings → Pages**.
4. Set the source to **GitHub Actions**.
5. Wait for the `Deploy to GitHub Pages` workflow to complete.
6. Your site will be available at:
   `https://YOUR_USERNAME.github.io/wk-x7f2m9qz3k/`

The app is configured with relative paths (`base: "./"`), so the repository name can be changed without editing the Vite config.

## iPhone installation

Open the published URL in Safari, tap **Share**, then **Add to Home Screen**. Launching it from the Home Screen uses standalone display mode.

## Local development

```bash
npm install
npm run dev
```
