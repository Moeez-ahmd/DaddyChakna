# PowerShell script for rebuilding production containers

Write-Host "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

Write-Host "Building frontend with correct production environment variables..."
docker-compose -f docker-compose.prod.yml build --no-cache frontend

Write-Host "Building backend..."
docker-compose -f docker-compose.prod.yml build backend

Write-Host "Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

Write-Host "Checking container status..."
docker-compose -f docker-compose.prod.yml ps

Write-Host "Production deployment complete!"
Write-Host "Frontend should now use /api instead of localhost:5000"
