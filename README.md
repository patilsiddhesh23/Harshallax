# Portfolio (Figma-matched scaffold)

A Vite + React + Tailwind scaffold that mirrors the provided Figma layout: header, hero banner, sticky profile/links card, sections for Short Videos (phone mock), Graphics Design, YouTube Thumbnails, Code + QR panel, UI/UX, and a red "THANKYOU" footer.

## Run

```powershell
npm install
npm run dev
```

Open http://localhost:5173 (or the shown port).

## Customize with your assets

- Replace placeholder images by editing `src/data.js` and/or swapping `img()` helpers in `src/App.jsx`.
- Tokens and utilities live in `src/index.css` and `tailwind.config.js`.
- Typography uses Inter via Google Fonts; update `index.html` to change.

## Notes

- This is a structural and styling match; exact pixel parity requires plugging in the real assets exported from Figma and adjusting colors in `tailwind.config.js` to your precise tokens.
- Add routes or more sections as needed.
