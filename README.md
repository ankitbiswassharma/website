# Musk-IT Website

## Production deployment on Hostinger VPS

This repository is wired for a single public entry point:

- Public URL: `http://76.13.246.57` until DNS/TLS is attached
- Public container: `nginx` on port `80`
- Internal frontend: Next.js on `frontend:3000`
- Internal backend: FastAPI on `backend:8000`
- Browser API base: `/api/v1`

Create a production env file before starting Docker Compose:

```bash
cp .env.production.example .env
```

Then replace every placeholder secret in `.env`, especially:

- `POSTGRES_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `SMTP_USER`
- `SMTP_PASSWORD`
- Razorpay keys when payments should be live

Start the stack:

```bash
docker compose up --build -d
```

Verify the backend/frontend connection through the public Nginx entry point:

```bash
curl http://76.13.246.57/api/v1/health
```

For a domain deployment, point DNS to `76.13.246.57`, then update `.env`:

```env
FRONTEND_URL=https://muskit.in
API_BASE_URL=https://muskit.in
CORS_ORIGINS=https://muskit.in,https://www.muskit.in
```

Terminate TLS either at your VPS Nginx/Certbot layer or extend `nginx/default.conf`
with a certificate-backed `443` server block.
