# DaddyChakna – Deployment Guide

## Architecture Overview

| Component | Technology | Hosted On |
|---|---|---|
| **Backend API** | Node.js + Express | AWS EC2 (Docker) |
| **Database** | MongoDB Atlas | Cloud (Atlas) |
| **Admin Panel** | React + Vite | AWS EC2 (Docker + Nginx) |
| **Mobile App** | Flutter (Android/iOS) | Local / App Store |

---

## Server Details

| Property | Value |
|---|---|
| **Provider** | AWS EC2 (ap-south-1 / Mumbai) |
| **Public DNS** | `ec2-13-232-153-75.ap-south-1.compute.amazonaws.com` |
| **SSH User** | `ubuntu` |
| **PEM Key** | `daddy-chakna.pem` (root of this repo) |
| **App Directory** | `/home/ubuntu/restaurant-app` |

---

## ⚡ Deploying New Changes (Recommended)

Push your code to GitHub first, then run the one-line deploy command from the **root of this repo**:

```bash
./deploy.sh
```

This script will:
1. SSH into the EC2 server using the PEM key
2. Run `git pull origin main` to fetch latest code
3. Rebuild only the backend Docker container (`--no-deps backend`)
4. Perform a health check on `http://localhost:5000/`
5. Print the last 10 lines of backend logs

> [!IMPORTANT]
> You must have `daddy-chakna.pem` in the root directory and run `./deploy.sh` from there.

---

## First-Time EC2 Setup (Already Done ✅)

If you ever provision a new EC2 instance, follow these steps:

### 1. SSH into the server
```bash
chmod 400 daddy-chakna.pem
ssh -i daddy-chakna.pem ubuntu@<YOUR-EC2-DNS>
```

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
newgrp docker
```

### 3. Clone the repository
```bash
cd /home/ubuntu
git clone https://github.com/Moeez-ahmd/DaddyChakna.git restaurant-app
cd restaurant-app
```

### 4. Create the production environment file
```bash
nano .env.prod
```

Add the following (replace values as needed):
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>
JWT_SECRET=<your-strong-secret>
VITE_API_URL=/api
```

### 5. Build and start Docker containers
```bash
sudo docker compose -f docker-compose.prod.yml up --build -d
```

### 6. Verify it's running
```bash
curl http://localhost:5000/
# Expected: {"message":"API is running..."}
```

---

## Manual SSH Commands

```bash
# SSH into server
ssh -i daddy-chakna.pem ubuntu@ec2-13-232-153-75.ap-south-1.compute.amazonaws.com

# Check running containers
sudo docker compose -f docker-compose.prod.yml ps

# View backend logs (live)
sudo docker compose -f docker-compose.prod.yml logs -f backend

# Restart backend only
sudo docker compose -f docker-compose.prod.yml restart backend

# Rebuild frontend + backend (full redeploy)
sudo docker compose -f docker-compose.prod.yml up --build -d
```

---

## API Endpoints (Production)

Base URL: `http://ec2-13-232-153-75.ap-south-1.compute.amazonaws.com:5000`

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

**Backend not responding?**
```bash
sudo docker compose -f docker-compose.prod.yml logs --tail=50 backend
```

**Port 5000 blocked?**
- Ensure the EC2 Security Group has an **Inbound Rule** for port `5000` from `0.0.0.0/0`.

**MongoDB connection error?**
- Verify the `MONGODB_URI` in `.env.prod` is correct.
- Ensure the EC2 IP is whitelisted in MongoDB Atlas > Network Access.

**Git pull fails?**
- The repo is public, so HTTPS cloning works without credentials.
- If you get "not a git repo" errors, delete and re-clone: `rm -rf ~/restaurant-app && git clone https://github.com/Moeez-ahmd/DaddyChakna.git restaurant-app`
