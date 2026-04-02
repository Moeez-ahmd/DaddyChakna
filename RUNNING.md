# DaddyChakna – Deployment Guide

## Architecture Overview

| Component | Technology | Hosted On |
|---|---|---|
| **Backend API** | Node.js + Express | AWS EC2 (Docker) |
| **Database** | MongoDB Atlas | Cloud (Atlas) |
| **Admin Panel** | React + Vite | AWS EC2 (Docker + Nginx) |
| **Mobile App** | Flutter (Android/iOS) | Local / App Store |

---

## CI/CD (automatic deploy)

Pushes to the **`main`** branch trigger GitHub Actions, which SSHs into EC2, syncs the repo to `origin/main`, writes `.env.prod` from secrets, and runs `docker compose ... up --build -d`.

### 1. GitHub repository secrets

In the repo: **Settings → Secrets and variables → Actions**, add:

| Secret | Description |
|---|---|
| `EC2_SSH_KEY` | Full EC2 private key (`.pem` contents), including `BEGIN` / `END` lines |
| `EC2_HOST` | Public DNS or IP, e.g. `ec2-xxx.ap-south-1.compute.amazonaws.com` |
| `EC2_USER` | SSH user (usually `ubuntu`) |
| `MONGODB_URI` | MongoDB connection string for production |
| `JWT_SECRET` | Backend JWT secret |

Optional:

| Secret | Description |
|---|---|
| `EC2_APP_DIR` | App path on the server (default: `/home/ubuntu/restaurant-app`) |

### 2. GitHub environment (optional)

The workflow uses `environment: production` so you can restrict secrets to that environment or require approvals. If you prefer not to use environments, remove the `environment: production` line from `.github/workflows/deploy.yml`.

### 3. EC2 prerequisites

- Docker and Docker Compose plugin installed; `ubuntu` can run `sudo docker compose`.
- A **git clone** of this repository at `/home/ubuntu/restaurant-app` (or your `EC2_APP_DIR`), with `origin` pointing at this GitHub repo.
- If the repo is **private**, configure a [deploy key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys/deploy-keys) or other credentials on the server so `git fetch` works.

Manual deploy from the **Actions** tab: run workflow **Deploy to AWS EC2** → **Run workflow**.

---

## Server reference

| Property | Example / notes |
|---|---|
| **App directory** | `/home/ubuntu/restaurant-app` (or `EC2_APP_DIR`) |
| **Compose file** | `docker-compose.prod.yml` |

---

## First-time EC2 setup

### 1. SSH into the server

Use your AWS key locally (do not commit `.pem` files to git).

### 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
```

### 3. Clone the repository

```bash
cd /home/ubuntu
git clone https://github.com/Moeez-ahmd/DaddyChakna.git restaurant-app
cd restaurant-app
```

### 4. Deploy

Configure GitHub secrets as above, then push to `main` or run the workflow manually. `.env.prod` is created on each deploy from secrets (you do not need a permanent `.env.prod` on disk for CI, though you may keep one for emergency SSH use).

---

## Useful SSH commands (debugging)

```bash
ssh -i your-key.pem ubuntu@<EC2_HOST>

sudo docker compose -f docker-compose.prod.yml ps
sudo docker compose -f docker-compose.prod.yml logs -f backend
sudo docker compose -f docker-compose.prod.yml up --build -d
```

---

## API Endpoints (Production)

Use your server’s public URL. Admin nginx typically proxies `/api` to the backend.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | POST | No | Register new user |
| `/api/auth/login` | POST | No | Login |
| `/api/auth/me` | GET | Yes | Get current user |
| `/api/auth/me` | PUT | Yes | Update profile / password |
| `/api/menu` | GET | No | Get all menu items |
| `/api/categories` | GET | No | Get all categories |
| `/api/deals` | GET | No | Get active deals |
| `/api/banners` | GET | No | Get active banners |
| `/api/cart` | GET/PUT | Yes | Get / update cart |
| `/api/orders` | POST | Yes | Place an order |
| `/api/orders/myorders` | GET | Yes | Get my orders |

---

## Troubleshooting

**Workflow fails on `git fetch`?**  
Ensure the clone exists, `origin` is correct, and for private repos add deploy keys or a credential helper on the EC2 instance.

**Backend not responding?**

```bash
sudo docker compose -f docker-compose.prod.yml logs --tail=50 backend
```

**MongoDB connection error?**  
Check `MONGODB_URI` in GitHub secrets and Atlas network access (allow EC2 egress IP if required).
