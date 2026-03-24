# Use Node.js LTS version as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Set environment variables (can be overridden by AWS App Runner/ECS)
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["npm", "start"]
