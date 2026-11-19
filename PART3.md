# Part 3 — Admin, Campaigns & Billing (Member 3)

Branch: `admin-campaign-billing`

## Your files
- `public/js/admin.js` — KPI cards, charts, vendor directory, approve/block, register vendor
- `public/js/campaigns.js` — campaign budgets, KPI scoring form
- `public/js/billing.js` — ledger table, CSV export

## Tasks
1. Check the charts and the 10% commission maths.
2. Connect to `/api/vendors`, `/api/campaigns` and `/api/vendors/:id/kpi`.
3. In `index.html`, change only Tabs 1, 2, 3, 6 and the Register Vendor modal, and tell Member 1 first.

## Push
```bash
git checkout -b admin-campaign-billing
git add . && git commit -m "Add admin, campaigns and billing"
git push -u origin admin-campaign-billing
```
