# Fix for Production Network Error

## Problem
The frontend was trying to connect to `localhost:5000` instead of using the production API endpoint, causing:
```
GET http://localhost:5000/api/finance net::ERR_CONNECTION_REFUSED
Failed to fetch stats: AxiosError: Network Error
```

## Root Cause
The frontend was built without the correct production environment variables, so it defaulted to trying to connect directly to the backend instead of using the nginx proxy.

## Solution Applied

### 1. Environment Variables Created
- `.env.prod` - Production environment variables for docker-compose
- `restaurant_management_admin/.env.production` - Production environment for frontend

Both contain:
```
VITE_API_URL=/api
```

### 2. Docker Configuration Updated
- `docker-compose.prod.yml` - Added environment section for frontend
- `Dockerfile` - Set default VITE_API_URL to `/api` for safety

### 3. Deployment Scripts Created
- `rebuild-production.sh` - Linux/Mac deployment script
- `rebuild-production.ps1` - Windows deployment script

## How to Deploy the Fix

### Option 1: Using the deployment script (Recommended)
```bash
# On Linux/Mac
chmod +x rebuild-production.sh
./rebuild-production.sh

# On Windows
.\rebuild-production.ps1
```

### Option 2: Manual commands
```bash
# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Rebuild frontend with correct environment variables
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# Rebuild backend
docker-compose -f docker-compose.prod.yml build backend

# Start production containers
docker-compose -f docker-compose.prod.yml up -d
```

## Verification
After deployment, the frontend should:
1. Use `/api` endpoints instead of `localhost:5000`
2. Successfully connect through the nginx proxy
3. Load data without network errors

## Architecture
```
Browser → Nginx (port 80) → Backend (port 5000)
         ↓
    /api requests get proxied to backend
```

The nginx configuration in `restaurant_management_admin/nginx.conf` properly handles:
- `/api/*` → `http://backend:5000/api/*`
- `/uploads/*` → `http://backend:5000/uploads/*`
- Static files served directly

This ensures the frontend never needs to know the backend's direct address.
