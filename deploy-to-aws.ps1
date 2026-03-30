# PowerShell AWS Deployment Script
# DNS: ec2-3-111-196-252.ap-south-1.compute.amazonaws.com
# PEM: daddys-chakna-key.pem

$AWS_DNS = "ec2-3-111-196-252.ap-south-1.compute.amazonaws.com"
$PEM_FILE = "daddys-chakna-key.pem"
$REMOTE_USER = "ubuntu"
$REMOTE_DIR = "/home/ubuntu/restaurant-app"

Write-Host "=== Deploying to AWS Server: $AWS_DNS ==="

# Check if PEM file exists
if (-not (Test-Path $PEM_FILE)) {
    Write-Host "Error: PEM file '$PEM_FILE' not found in current directory"
    exit 1
}

# Check if scp and ssh are available (Git Bash or WSL required)
try {
    ssh -V 2>$null
} catch {
    Write-Host "Error: ssh not found. Please use Git Bash, WSL, or install OpenSSH"
    exit 1
}

Write-Host "1. Copying project files to AWS..."

# Copy files using scp
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no -r `
    restaurant_management_admin/ `
    restaurant_management_backend/ `
    docker-compose.prod.yml `
    .env.prod `
    aws-deploy-commands.sh `
    "$REMOTE_USER@$AWS_DNS`:$REMOTE_DIR/"

Write-Host "2. Executing deployment on AWS server..."

# Execute deployment script on remote server
ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$REMOTE_USER@$AWS_DNS" "cd $REMOTE_DIR && chmod +x aws-deploy-commands.sh && ./aws-deploy-commands.sh"

Write-Host "=== Deployment Complete ==="
Write-Host "Your application should now be accessible at: http://$AWS_DNS"
Write-Host "Frontend should no longer show localhost:5000 connection errors"
