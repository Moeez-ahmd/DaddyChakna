#!/bin/bash

echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

echo "Building frontend with correct production environment variables..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend

echo "Building backend..."
docker-compose -f docker-compose.prod.yml build backend

echo "Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

echo "Checking container status..."
docker-compose -f docker-compose.prod.yml ps

echo "Production deployment complete!"
echo "Frontend should now use /api instead of localhost:5000"
