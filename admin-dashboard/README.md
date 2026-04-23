# Mashhor Hub Admin Dashboard

React + Vite admin panel for CMS, ERP, media, users, and platform settings.

## Environment

Create `admin-dashboard/.env` from `.env.example`.

```env
VITE_API_URL=http://localhost:5000/api
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`

## Notes

- Authentication depends on Firebase client auth plus backend token verification.
- Role resolution falls back to backend `/api/auth/me` when custom claims are missing.
- Production error screens avoid exposing raw stack traces to end users.
