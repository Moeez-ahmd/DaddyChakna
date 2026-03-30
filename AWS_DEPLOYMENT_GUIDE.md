# AWS Deployment Guide - Network Error Fix

## Server Details
- **Public DNS**: `ec2-3-111-196-252.ap-south-1.compute.amazonaws.com`
- **PEM File**: `daddys-chakna-key.pem`
- **User**: `ubuntu`

## Prerequisites
1. Git Bash or WSL installed on Windows (for ssh/scp commands)
2. Your .pem file in the project directory

## Step 1: Open Git Bash (or WSL)
Navigate to your project directory:
```bash
cd /c/Users/Moeez/Downloads/Rest
```

## Step 2: Set PEM File Permissions
```bash
chmod 400 daddys-chakna-key.pem
```

## Step 3: Copy Files to AWS Server
```bash
# Create remote directory
ssh -i daddys-chakna-key.pem -o StrictHostKeyChecking=no ubuntu@ec2-3-111-196-252.ap-south-1.compute.amazonaws.com "mkdir -p /home/ubuntu/restaurant-app"

# Copy all project files
scp -i daddys-chakna-key.pem -o StrictHostKeyChecking=no -r \
    restaurant_management_admin/ \
    restaurant_management_backend/ \
    docker-compose.prod.yml \
    .env.prod \
    aws-deploy-commands.sh \
    ubuntu@ec2-3-111-196-252.ap-south-1.compute.amazonaws.com:/home/ubuntu/restaurant-app/
```

## Step 4: Execute Deployment on AWS
```bash
ssh -i daddys-chakna-key.pem -o StrictHostKeyChecking=no ubuntu@ec2-3-111-196-252.ap-south-1.compute.amazonaws.com "cd /home/ubuntu/restaurant-app && chmod +x aws-deploy-commands.sh && ./aws-deploy-commands.sh"
```

## Step 5: Monitor Deployment (Optional)
```bash
# Watch the deployment logs
ssh -i daddys-chakna-key.pem ubuntu@ec2-3-111-196-252.ap-south-1.compute.amazonaws.com "cd /home/ubuntu/restaurant-app && docker-compose -f docker-compose.prod.yml logs -f"
```

## Step 6: Verify Fix
After deployment completes:
1. Open your browser and go to: `http://ec2-3-111-196-252.ap-south-1.compute.amazonaws.com`
2. Open browser console (F12)
3. The error `GET http://localhost:5000/api/finance net::ERR_CONNECTION_REFUSED` should be gone
4. Data should load properly from `/api` endpoints

## What the Fix Does
- Forces frontend to use `/api` instead of `localhost:5000`
- Routes API requests through nginx proxy
- Eliminates network connection errors in production

## Troubleshooting
If deployment fails:
```bash
# Check container status
ssh -i daddys-chakna-key.pem ubuntu@ec2-3-111-196-252.ap-south-1.compute.amazonaws.com "cd /home/ubuntu/restaurant-app && docker-compose -f docker-compose.prod.yml ps"

# Check logs
ssh -i daddys-chakna-key.pem ubuntu@ec2-3-111-196-252.ap-south-1.compute.amazonaws.com "cd /home/ubuntu/restaurant-app && docker-compose -f docker-compose.prod.yml logs"
```

## Quick One-Liner (Advanced)
If you're comfortable with Linux commands, you can run everything in one go:
```bash
chmod 400 daddys-chakna-key.pem && ssh -i daddys-chakna-key.pem -o StrictHostKeyChecking=no ubuntu@ec2-3-111-196-252.ap-south-1.compute.amazonaws.com "mkdir -p /home/ubuntu/restaurant-app" && scp -i daddys-chakna-key.pem -o StrictHostKeyChecking=no -r restaurant_management_admin/ restaurant_management_backend/ docker-compose.prod.yml .env.prod aws-deploy-commands.sh ubuntu@ec2-3-111-196-252.ap-south-1.compute.amazonaws.com:/home/ubuntu/restaurant-app/ && ssh -i daddys-chakna-key.pem -o StrictHostKeyChecking=no ubuntu@ec2-3-111-196-252.ap-south-1.compute.amazonaws.com "cd /home/ubuntu/restaurant-app && chmod +x aws-deploy-commands.sh && ./aws-deploy-commands.sh"
```
