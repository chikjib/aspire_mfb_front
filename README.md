# Aspire MFB frontend

Vue 3 + Vite frontend using the Options API, Vue Router and the Aspire Template 3 visual direction.

## Start

```bash
npm install
npm run dev
```

The Vite server proxies `/api` to Django at `http://127.0.0.1:8001`.

## Structure

- `src/pages` — routed page modules
- `src/components` — shared header, footer, hero and CMS section renderers
- `src/router` — public routes matching the Aspire website menu
- `src/services/api.js` — Django CMS API client

Page copy, menus, branches and FAQs are edited in Django admin rather than in Vue files.
