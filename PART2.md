# Part 2 — Backend, Database & Vendor Portal (Member 2)

Branch: `backend-vendor-portal`

## Your files
- `server/server.js` — Express API
- `server/schema.sql` — MySQL tables and sample data
- `server/package.json`, `server/.env.example`
- `public/js/vendor-portal.js` — vendor workspace in the browser

## Tasks
1. Run `schema.sql` in MySQL, copy `.env.example` to `.env`, then `cd server && npm install && npm start`.
2. Connect the vendor portal to `/api/products` and `/api/messages`.
3. Load the first data from `/api/bootstrap`.
4. In `index.html`, change only the "TAB 4: VENDOR PORTAL" section, and tell Member 1 first.

## Push
```bash
git checkout -b backend-vendor-portal
git add . && git commit -m "Add backend and vendor portal"
git push -u origin backend-vendor-portal
```
