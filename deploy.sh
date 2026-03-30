#!/bin/bash
# =============================================================
# DaddyChakna - One-Command Deployment Script
# Usage: ./deploy.sh
# =============================================================

PEM_FILE="daddy-chakna.pem"
AWS_HOST="ubuntu@ec2-13-232-153-75.ap-south-1.compute.amazonaws.com"
APP_DIR="/home/ubuntu/restaurant-app"

# --- Validate PEM file ---
if [ ! -f "$PEM_FILE" ]; then
    echo "❌ PEM file '$PEM_FILE' not found. Run this from the DaddyChakna root directory."
    exit 1
fi

chmod 400 "$PEM_FILE"

echo "🚀 Deploying to EC2..."
echo "   Host: $AWS_HOST"
echo "   App:  $APP_DIR"
echo ""

ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$AWS_HOST" bash << REMOTE
set -e
cd $APP_DIR

echo "🔄 [1/4] Pulling latest code from GitHub..."
git pull origin main

echo "🏗️  [2/4] Rebuilding backend Docker image..."
sudo docker compose -f docker-compose.prod.yml up --build -d --no-deps backend

echo "⏳ [3/4] Waiting for container to start..."
sleep 5

echo "✅ [4/4] Health check..."
curl -sf http://localhost:5000/ && echo " Backend is UP ✅" || echo " Backend may have failed - check logs ⚠️"

echo ""
echo "📋 Recent backend logs:"
sudo docker compose -f docker-compose.prod.yml logs --tail=10 backend

echo ""
echo "🎉 Deployment complete!"
REMOTE
