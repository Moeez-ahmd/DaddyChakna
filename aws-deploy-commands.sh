#!/bin/bash
# AWS Deployment Commands - Run this on your AWS server

echo "=== Deploying Network Error Fix ==="
echo "Current directory: $(pwd)"
echo "Date: $(date)"

# Stop existing containers
echo "1. Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old frontend image to ensure clean rebuild
echo "2. Removing old frontend image..."
docker rmi rest-frontend 2>/dev/null || true

# Build frontend with correct production environment variables
echo "3. Building frontend with VITE_API_URL=/api..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend

# Build backend
echo "4. Building backend..."
docker-compose -f docker-compose.prod.yml build backend

# Start production containers
echo "5. Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for containers to start
echo "6. Waiting for containers to initialize..."
sleep 10

# Check container status
echo "7. Checking container status..."
docker-compose -f docker-compose.prod.yml ps

# Check logs for any errors
echo "8. Checking frontend logs..."
docker-compose -f docker-compose.prod.yml logs frontend

echo "9. Checking backend logs..."
docker-compose -f docker-compose.prod.yml logs backend

echo "=== Deployment Complete ==="
echo "Frontend should now use /api instead of localhost:5000"
echo "Test by accessing your application and checking the browser console for network errors"
