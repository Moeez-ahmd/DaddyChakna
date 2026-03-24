# Deployment Script (Safe Version)
Write-Host "🚀 Packaging application..."
tar --exclude="node_modules" --exclude=".git" -czvf deployment.tar.gz restaurant_management_admin restaurant_management_backend docker-compose.prod.yml remote_deploy.sh

Write-Host "📤 Uploading files to EC2 server..."
scp -i daddys-chakna-key.pem -o StrictHostKeyChecking=no deployment.tar.gz ubuntu@ec2-3-111-196-252.ap-south-1.compute.amazonaws.com:~

Write-Host "🏗️ Executing remote deployment..."
ssh -i daddys-chakna-key.pem -o StrictHostKeyChecking=no ubuntu@ec2-3-111-196-252.ap-south-1.compute.amazonaws.com "tar -xzvf deployment.tar.gz && bash remote_deploy.sh"

Write-Host "✅ Deployment Complete!"
