# market-frontend

React 18 SPA untuk buyer, seller, dan admin panel. Vite 7, Tailwind CSS 4, TanStack React Query.

## Portal

Aplikasi punya 3 portal dengan layout terpisah:

- **Buyer** — `/` sampai `/checkout`
- **Seller** — `/seller/*`
- **Admin** — `/admin/*`

## Setup

```bash
npm install
cp .env.example .env
```

Set `VITE_API_BASE_URL` ke backend API (default `http://localhost:8000`).

## Menjalankan

```bash
npm run dev
```

## Build

```bash
npm run build
```

Output ke `dist/`. Deploy hasil build ke web server statis atau Nginx.

## Test

```bash
npm run test
```

Jalankan Vitest di jsdom. Test ada di `src/` berdekatan dengan file yang diuji (`*.test.js` / `*.test.jsx`).

## Lint

```bash
npm run lint       # cek
npm run lint:fix   # auto-fix
```

Konfigurasi ada di `eslint.config.js`. Parser: Babel (JSX via `@babel/plugin-syntax-jsx`).
