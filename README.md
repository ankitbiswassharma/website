# Musk-IT Website

## Local Docker Compose

Run the full local stack with Postgres, FastAPI, and Next.js:

```bash
docker compose -f docker-compose.local.yml up --build
```

Local defaults are built into `docker-compose.local.yml`, so a fresh clone can
start without a committed `.env`. To customize ports or local credentials:

```bash
cp .env.local.example .env
```

Useful local URLs:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8000/api/v1/health`
- Postgres: `localhost:5432`

Stop the local stack:

```bash
docker compose -f docker-compose.local.yml down
```

## CI/CD

GitHub Actions are configured in `.github/workflows`.

- `ci.yml` runs on pushes and pull requests to `main`. It installs frontend
  dependencies, runs `npm test`, builds Next.js, checks backend Python syntax,
  validates both Compose files, and builds both Docker images.
- `deploy.yml` deploys the production Compose stack over SSH on pushes to
  `main`, and can also be run manually with `workflow_dispatch`. It verifies the
  target commit on the VPS before rebuilding Docker.

Configure these GitHub secrets before enabling production deploys:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PATH`
- `DEPLOY_PORT` (optional, defaults to `22`)
- `DEPLOY_BRANCH` (optional, defaults to `main`)

The server must already have Docker, Docker Compose, this repository checked out
at `DEPLOY_PATH`, and a production `.env` created from `.env.production.example`.

## Production deployment on Hostinger VPS

This repository is wired for a single public entry point:

- Public URL: `https://muskit.in`
- Public proxy: Traefik on ports `80` and `443`
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
- `TRAEFIK_CERT_EMAIL`
- Razorpay keys when payments should be live

Make sure DNS for `muskit.in` and `www.muskit.in` points to `76.13.246.57`.
If Ubuntu Nginx is already installed on the VPS, stop it before starting Docker
because this Compose file owns ports `80` and `443`:

```bash
sudo systemctl disable --now nginx
```

Start the stack:

```bash
docker compose up --build -d
```

Verify the backend/frontend connection through the public Traefik entry point:

```bash
curl https://muskit.in/api/v1/health
```

Traefik issues and renews the Let's Encrypt certificate automatically using the
HTTP challenge on port `80`. If certificate issuance fails, check that DNS points
to the VPS, ports `80` and `443` are open in the firewall, and no host process is
already using those ports.

This stack uses Traefik's file provider at `traefik/dynamic/muskit.yml` instead
of the Docker provider, so it does not depend on Docker socket API negotiation.
If an older `muskit_website_certbot_init` container appears in logs, it is an
orphan from the previous config; remove it with `docker compose up -d --remove-orphans`.

If Traefik returns `502 Bad Gateway`, isolate the failing layer on the VPS:

```bash
docker compose ps
docker compose logs --tail=120 backend
docker compose logs --tail=120 traefik
docker compose exec traefik wget -S -O- http://backend:8000/api/v1/health
docker compose exec traefik wget -S -O- http://frontend:3000/api/v1/health
```
