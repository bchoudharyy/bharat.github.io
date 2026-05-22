# Bharat Cyber-Portal

This repository includes a static portfolio frontend and an Express backend for admin content editing.

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:5000`.

## Deploy the full site for free on Render

1. Create a free Render account at https://render.com.
2. Connect your GitHub account and import this repository.
3. Choose the `main` branch.
4. Render should detect the `package.json` and use these commands:
   - Build command: `npm install`
   - Start command: `npm start`
5. Deploy the service.

The Express server serves the public website and backend API from the same app.

## Notes

- The backend admin login and content API require the Node server.
- GitHub Pages can host the static site only, but not the Express admin/API.
- Use `portfolio-backend/.env.example` to configure `ADMIN_SECRET` if needed.
