# Mashhor Hub Website

Production website, admin dashboard, and API for Mashhor Hub.

## Structure

- `api/`: Express + Firebase Admin backend
- `admin-dashboard/`: React + Vite admin panel
- root static HTML/CSS/JS: public website

## Local Development

1. Configure environment files:
   - `api/.env`
   - `admin-dashboard/.env`
2. Install dependencies:
   - `npm install`
   - `npm install --prefix api`
   - `npm install --prefix admin-dashboard --legacy-peer-deps`
3. Run the stack:
   - `npm run dev`

## Deployment Notes

- API CORS is controlled by `api/src/server.js` using `CORS_ORIGIN`.
- Do not re-add wildcard CORS headers in `vercel.json`.
- Admin auth roles should exist either in Firebase custom claims or Firestore `admins/{uid}`.
- Media uploads require a working Firebase Storage bucket.

## Pre-Launch Checklist

- Set all production environment variables in Vercel.
- Confirm Firebase Admin credentials are valid.
- Confirm `CORS_ORIGIN` includes the final production origin(s).
- Build the admin dashboard in a normal Windows shell or CI environment.
- Smoke test:
  - `/`
  - `/ar/`
  - `/admin`
  - `/api/health`
  - login, media upload, CMS update, ERP create/edit
