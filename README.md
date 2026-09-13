# Boithokkhana café ordering

The customer frontend is a React/Vite app. The worker order desk is at `/admin`. An Express API writes shared orders to Neon Postgres; the database connection string is never sent to the browser. Vercel serves the Vite bundle and mounts the API as a Node function in the same project.

## Repository layout

```text
api/                 Vercel function entry
server/src/          Express app, authentication, database access and rules
server/migrations/   Neon Postgres schema
server/scripts/      Database migration and worker provisioning
shared/              Menu catalogue and contracts used by client and server
src/                 React customer pages and staff order desk
public/              Static favicon
docs/                Excalidraw-compatible Mermaid flowchart
vercel.json          API routing and SPA deep links
```

## Run locally

1. Install packages: `npm install`.
2. Run the frontend: `npm run dev` (default `http://127.0.0.1:5173`). Until connected ordering is enabled, checkout is explicitly a local demo and workers cannot see those demo orders.
3. In a separate terminal, run `npm run server:dev`. `/api/health` will report `{ "configured": false }` until a Neon URL is supplied.

## Connect Neon

1. Copy `.env.example` to `.env`. Put the **pooled** Neon Postgres connection string from your Neon dashboard in `DATABASE_URL`, including `sslmode=require`. Keep `.env` private; it is git-ignored. Never name the secret `VITE_DATABASE_URL` or put it in frontend code.
2. Set `APP_ORIGIN` to the exact browser origin where staff use the app. For local development it defaults to `http://127.0.0.1:5173`. On Vercel, the API derives the HTTPS origin from the request host unless you explicitly override it.
3. Run `npm run db:migrate` once for the new database.
4. Create each worker account with `WORKER_EMAIL`, `WORKER_NAME`, `WORKER_ROLE` (`staff` or `manager`), and `WORKER_PASSWORD` (at least 12 characters) set as **private environment variables**. Then run `npm run worker:create`. Avoid putting a real password in a checked-in file or command-line argument. In PowerShell, a non-echoed prompt can be used: `$env:WORKER_PASSWORD = (Read-Host 'Worker password' -AsSecureString | ConvertFrom-SecureString -AsPlainText)`. Remove the environment variable after provisioning with `Remove-Item Env:WORKER_PASSWORD`.
5. Set `VITE_ORDER_MODE=server` in `.env`, restart **both** Vite and the API, and submit a test order from the frontend. The same order will then appear at `/admin` for signed-in staff. If the API fails in connected mode, checkout retains the cart and shows an error instead of silently creating a local-only order.

Do not take actual payment with the **Demo Online Payment** option. It records no transaction; staff must collect/confirm payment separately. For a real payment provider, implement its secure server-side checkout and webhook before advertising online payment.

## Deploy with Vercel

1. Import the GitHub repository into Vercel with the repository root as the project root. The checked-in `vercel.json` selects the Vite framework, runs `npm run build`, serves `dist`, sends `/api/*` to the Express function, and sends customer/admin deep links to `index.html`.
2. For a **demo-only** deployment, do not configure Neon. Checkout remains local to the visitor's browser; `/admin` correctly reports that setup is required.
3. For **shared ordering**, configure `DATABASE_URL` as a private Vercel environment variable and `VITE_ORDER_MODE=server` as a build-time variable for the relevant environment (Production, Preview, or both). Never create `VITE_DATABASE_URL`. Run the migration and create the first manager account privately from a local machine using the same Neon URL, then redeploy. Production and Preview should use separate Neon databases if you do not want test orders mixed with live orders.
4. Check `/api/health`, place a test order, and sign in at `/admin`. A production build without Neon credentials cannot be tested end-to-end until the URL and account exist. Configure Vercel Firewall rate limiting for public checkout and worker login before accepting real traffic. Online payment remains a demo even when order storage is connected.

Do not run the long-lived `server:start` listener on Vercel. `api/index.ts` imports the Express app directly as a function. `APP_ORIGIN` can override the derived same-origin check if you use a special proxy setup; `API_HOST` is only for the local Node listener.

## Order flow

The API validates item IDs, quantities, customization options, customer fields, and payment method. It calculates prices from `shared/catalog.ts` and writes `orders`, `order_items`, and a creation event in one transaction. `client_request_id` is an idempotency key: retries return the saved receipt. Staff sign in with a password hashed using scrypt; the API stores a hashed session token and sends the raw token only as an HttpOnly, SameSite cookie. Workers can claim unassigned orders and advance only their own assignments; managers can manage all orders and cancel them. Every claim and status change is recorded in `order_events`. The dashboard polls every 10 seconds and supports manual refresh. Version checks prevent an older dashboard view from overwriting a newer status.

Schema: `server/migrations/001_init.sql`. API: `server/src/app.ts`. Local listener: `server/src/index.ts`. Vercel adapter: `api/index.ts`. Worker desk: `src/pages/AdminPage.tsx`.

## Checks

`npm run build` type-checks client and server and produces the Vite bundle. `npm test` runs cart/checkout and server order-rule tests. Database-backed integration testing requires a configured disposable Neon database and is not run without credentials.
