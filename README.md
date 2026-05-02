# Wildlife Compliance Tracker

A public-demo wildlife trade compliance dashboard with shipment risk checks, editable compliance records, live analytics, and report downloads.

## Local Development

Run the backend:

```bash
cd backend
npm install
npm run dev
```

Run the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` or the port Vite prints.

## Public Hosting

Recommended simple setup:

- Frontend: Netlify
- Backend API: Render

This repo includes `netlify.toml` and `render.yaml` to make that deployment path easier.

### 1. Push To GitHub

Create a GitHub repository and push this project.

### 2. Deploy Backend On Render

Create a Render Web Service from the GitHub repo.

Use:

```txt
Root directory: backend
Build command: npm install
Start command: npm start
```

Set this environment variable after the frontend is deployed:

```txt
FRONTEND_URL=https://your-netlify-site.netlify.app
```

Render will give you an API URL like:

```txt
https://wildlife-compliance-api.onrender.com
```

### 3. Deploy Frontend On Netlify

Create a Netlify site from the same GitHub repo.

The included `netlify.toml` uses:

```txt
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

Set this Netlify environment variable:

```txt
VITE_API_URL=https://your-render-api.onrender.com/api
```

Redeploy Netlify after adding the variable.

### 4. Demo Access

The hosted frontend includes a **Continue as demo** button, so visitors can enter the project without knowing credentials.

If the backend is online, demo access uses the backend demo user. If the backend is unavailable, the app opens in offline demo mode so people can still inspect the UI.

## Notes

- Current data storage is demo-oriented. Editable records are stored in browser `localStorage`.
- Backend users and sample shipments are in-memory mock data.
- For a production multi-user app, connect records, users, and validation history to a hosted database before sharing it as a real operational tool.

## Useful Docs

- Netlify Vite apps: https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/
- Render Node/Express apps: https://render.com/docs/deploy-node-express-app
