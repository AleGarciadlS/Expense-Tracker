# Expense Tracker — Receipts + OCR (PWA)

## Run locally
```bash
npm install
npm run dev
```

## Tests
```bash
npm test
```

## Deploy on Vercel
1. Push this folder to GitHub.
2. On vercel.com → New Project → Import repo.
3. Add env var: `VITE_BCU_PROXY = https://YOUR-PROJECT.vercel.app/api/bcu-proxy`
4. Deploy, then Redeploy to pick up env var.