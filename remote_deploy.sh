#!/bin/bash
echo "📦 Extracting application..."
tar -xzvf deployment.tar.gz
echo "🏗️ Building and starting containers..."
sudo docker compose -f docker-compose.prod.yml up --build -d
echo "✅ Remote deployment task finished."
