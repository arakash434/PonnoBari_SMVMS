# SMVMS — Smart Marketing Vendor Management System

## চালানোর নিয়ম

**শুধু ফ্রন্টএন্ড দেখতে:** `public/index.html` ব্রাউজারে খোলো। ডেমো ডাটায় চলবে।

**ব্যাকএন্ডসহ:**
1. MySQL এ `server/schema.sql` ইমপোর্ট করো।
2. `server/.env.example` কপি করে `server/.env` বানাও, পাসওয়ার্ড বসাও।
3. `cd server && npm install && npm start`
4. ব্রাউজারে `http://localhost:5000`

ডেমো লগইন (পাসওয়ার্ড `demo123`): admin@smvms.com, marketing@smvms.com, vendor@smvms.com, customer@smvms.com

## তিন ভাগ

### সদস্য ১ — অ্যাপ কাঠামো, লগইন ও কাস্টমার স্টোর
Branch: `frontend-auth-store`

| ফাইল | কাজ |
|---|---|
| `public/js/core.js` | সবার ব্যবহৃত মূল state, tab বদল, home tiles, `renderAll` |
| `public/js/auth.js` | landing, login/sign-up, session, profile |
| `public/js/storefront.js` | কাস্টমারের পণ্য তালিকা, কেনা, রসিদ |
| `public/js/main.js` | অ্যাপ চালু করার ক্রম |
| `public/index.html` | landing, auth, header, storefront ও receipt অংশ |

করণীয়: লগইন ও role অনুযায়ী মেনু ঠিক করা, স্টোর ও রসিদ সুন্দর করা, কেনার সময় `POST /api/orders` ডাকা।

### সদস্য ২ — ব্যাকএন্ড, ডাটাবেস ও ভেন্ডর পোর্টাল
Branch: `backend-vendor-portal`

| ফাইল | কাজ |
|---|---|
| `server/server.js` | Express API |
| `server/schema.sql` | MySQL টেবিল ও নমুনা ডাটা |
| `public/js/vendor-portal.js` | ভেন্ডরের পণ্য যোগ/মোছা, আয়, Admin কে মেসেজ |
| `public/index.html` | "TAB 4: VENDOR PORTAL" অংশ |

করণীয়: ডাটাবেস ও API চালু রাখা, ভেন্ডর পোর্টালকে `/api/products` ও `/api/messages` এর সাথে যুক্ত করা, `/api/bootstrap` থেকে শুরুর ডাটা লোড করা।

### সদস্য ৩ — অ্যাডমিন, ক্যাম্পেইন ও বিলিং
Branch: `admin-campaign-billing`

| ফাইল | কাজ |
|---|---|
| `public/js/admin.js` | KPI কার্ড, চার্ট, ভেন্ডর তালিকা, Approve/Block, ভেন্ডর রেজিস্ট্রেশন |
| `public/js/campaigns.js` | ক্যাম্পেইন বাজেট, KPI স্কোর ফর্ম |
| `public/js/billing.js` | Ledger টেবিল, CSV রিপোর্ট |
| `public/index.html` | Tab 1, 2, 3, 6 ও Register Vendor modal অংশ |

করণীয়: চার্ট ও হিসাব যাচাই করা, `/api/vendors`, `/api/campaigns`, `/api/vendors/:id/kpi` এর সাথে যুক্ত করা।

## নিয়ম
- নিজের branch এ কাজ করো, সরাসরি `main` এ push কোরো না।
- নিজের ফাইল ও `index.html` এর নিজের অংশ ছাড়া অন্য কিছু বদলাতে হলে আগে জানাও।
- `core.js` সবার ব্যবহৃত, তাই বদলানোর আগে সদস্য ১ কে বলো।
- কাজ শেষে Pull Request দাও, অন্য একজন দেখে merge করবে।

## Git দ্রুত নিয়ম
```bash
git clone <repo-url> && cd smvms
git checkout -b <তোমার-branch>
git add . && git commit -m "কী করেছ"
git push -u origin <তোমার-branch>
```
