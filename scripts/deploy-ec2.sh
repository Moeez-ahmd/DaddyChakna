#!/usr/bin/env bash
# Run on Ubuntu EC2 in the app directory (contains docker-compose.prod.yml).
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/restaurant-app}"
cd "$APP_DIR"

echo "==> Working directory: $(pwd)"

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installing Docker..."
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sudo sh /tmp/get-docker.sh
  sudo usermod -aG docker ubuntu 2>/dev/null || true
fi

# Use sudo until the shell session picks up the docker group (new login).
if ! sudo docker compose version >/dev/null 2>&1; then
  if command -v docker-compose >/dev/null 2>&1; then
    DC() { sudo docker-compose "$@"; }
  else
    echo "Docker Compose not found. Install docker compose plugin."
    exit 1
  fi
else
  DC() { sudo docker compose "$@"; }
fi

sudo mkdir -p /home/ubuntu/uploads
sudo chown ubuntu:ubuntu /home/ubuntu/uploads 2>/dev/null || true

# Build .env.prod for backend
if [[ ! -f .env.prod ]]; then
  if [[ -f restaurant_management_backend/.env ]]; then
    cp restaurant_management_backend/.env .env.prod
  else
    echo "Missing restaurant_management_backend/.env — create .env.prod with MONGODB_URI and JWT_SECRET."
    exit 1
  fi
fi

sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' .env.prod || true

python3 << 'PY'
import pathlib, re
root = pathlib.Path(".")
env_prod = root / ".env.prod"
be_env = root / "restaurant_management_backend" / ".env"
text = env_prod.read_text(encoding="utf-8", errors="replace")
if re.search(r"^MONGODB_URI=mongodb://localhost", text, re.M) and be_env.exists():
    be = be_env.read_text(encoding="utf-8", errors="replace")
    m = re.search(r"^#\s*MONGODB_URI=(mongodb\+srv://[^\r\n]+)", be, re.M)
    if m:
        uri = m.group(1).strip()
        text = re.sub(r"^MONGODB_URI=.*", f"MONGODB_URI={uri}", text, flags=re.M)
        env_prod.write_text(text, encoding="utf-8")
        print("==> Switched MONGODB_URI from localhost to Atlas (from commented line in backend .env).")
PY

grep -q '^VITE_API_URL=' .env.prod || echo 'VITE_API_URL=/api' >> .env.prod

echo "==> Building and starting containers..."
DC -f docker-compose.prod.yml down 2>/dev/null || true
DC -f docker-compose.prod.yml build --no-cache frontend
DC -f docker-compose.prod.yml build backend
DC -f docker-compose.prod.yml up -d

DC -f docker-compose.prod.yml ps
echo "==> Recent logs (frontend):"
DC -f docker-compose.prod.yml logs --tail=40 frontend
echo "==> Recent logs (backend):"
DC -f docker-compose.prod.yml logs --tail=40 backend

echo "==> HTTP/HTTPS checks (from this server, after brief warmup):"
sleep 3
curl -sS -o /dev/null -w "http / (expect 301 to HTTPS) : %{http_code}\n" http://127.0.0.1/ || true
curl -k -sS -o /dev/null -w "https / : %{http_code}\n" https://127.0.0.1/ || true
curl -k -sS -o /dev/null -w "https /api/categories : %{http_code}\n" https://127.0.0.1/api/categories || true
curl -sS -o /dev/null -w "backend :5000 /api/categories : %{http_code}\n" http://127.0.0.1:5000/api/categories || true

echo "==> Done."
