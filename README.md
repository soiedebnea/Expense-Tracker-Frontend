# Expense Tracker: Frontend

Single-page app built with **React 18, Vite and Recharts**. It talks to the backend REST API.

## Requirements
- Node.js 18 or higher (check with `node -v`)
- The backend running (see `backend/README.md`)

## Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Create a file named `.env` inside the `frontend` folder (copy `.env.example`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   The port must match the backend `PORT`.
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open the address shown in the terminal, usually **http://localhost:5173**.

Keep the terminal open while using the app. Start the backend in a second terminal first or after, but it must be running.

**Important:** never open `index.html` by double-clicking it. The app only works through the Vite address (`http://localhost:5173`), not `file:///...`.

## Scripts
| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |

## Environment variables
| Name | Default |
|------|---------|
| `VITE_API_URL` | `http://localhost:5000/api` |

Restart `npm run dev` after changing `.env`.

## Features
- Add and delete income and expense transactions
- Create and delete categories, each with a color
- Monthly totals: income, expenses and balance (choose any month)
- Charts: expenses by category (pie) and income vs expenses for the year (bar)

To change the currency symbol, edit `CURRENCY` at the top of `src/App.jsx`.

## Project structure
```
frontend/
├── index.html
├── package.json
├── vite.config.js         must have exactly this name
├── .env
└── src/
    ├── main.jsx
    ├── App.jsx            UI and state (capital A)
    ├── api.js             API calls
    └── styles.css
```

## Troubleshooting
| Problem | Fix |
|---------|-----|
| Blank page, console shows `file:///` CORS error | You opened `index.html` directly. Use `http://localhost:5173`. |
| `npm run dev` exits immediately with no `Local:` line | Check the file names above. `vite.config.js` is required, not `vite.js`. Then run `npm install` again. |
| Red error message at the top of the page | The backend is not running or cannot reach MongoDB. Check the backend terminal. |
| Page loads but no data, CORS error in console | Backend `CLIENT_URL` must match the address in your browser exactly. |
| Changes to `.env` ignored | Stop and restart `npm run dev`. |
| `npm audit` warnings | Safe to ignore for local development. Do not run `npm audit fix --force`. |
