#!/bin/bash

# AWS Deployment Script
# DNS: ec2-3-111-196-252.ap-south-1.compute.amazonaws.com
# PEM: daddys-chakna-key.pem

AWS_DNS="ec2-13-232-153-75.ap-south-1.compute.amazonaws.com"
PEM_FILE="daddy-chakna.pem"
REMOTE_USER="ubuntu"
REMOTE_DIR="/home/ubuntu/restaurant-app"

echo "=== Deploying to AWS Server: $AWS_DNS ==="

# Check if PEM file exists
if [ ! -f "$PEM_FILE" ]; then
    echo "Error: PEM file '$PEM_FILE' not found in current directory"
    exit 1
fi

# Set correct permissions for PEM file
chmod 400 "$PEM_FILE"

# Create remote directory if it doesn't exist
echo "1. Creating remote directory..."
ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$REMOTE_USER@$AWS_DNS" "mkdir -p $REMOTE_DIR"

# Copy project files to AWS server
echo "2. Copying project files to AWS..."
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no -r \
    restaurant_management_admin/ \
    restaurant_management_backend/ \
    docker-compose.prod.yml \
    .env.prod \
    aws-deploy-commands.sh \
    "$REMOTE_USER@$AWS_DNS:$REMOTE_DIR/"

# Execute deployment on AWS server
echo "3. Executing deployment on AWS server..."
ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$REMOTE_USER@$AWS_DNS" "cd $REMOTE_DIR && chmod +x aws-deploy-commands.sh && ./aws-deploy-commands.sh"

echo "=== Deployment Complete ==="
echo "Your application should now be accessible at: http://$AWS_DNS"
echo "Frontend should no longer show localhost:5000 connection errors"
