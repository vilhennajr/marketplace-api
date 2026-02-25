#!/bin/bash

# Script de deploy para produção
# Execute: chmod +x deploy.sh && ./deploy.sh

echo "🚀 Starting deployment..."

# Pull latest changes
echo "📦 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install --frozen-lockfile

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
pnpm prisma:generate

# Run migrations
echo "🗄️ Running database migrations..."
pnpm prisma:migrate deploy

# Build application
echo "🏗️ Building application..."
pnpm build

# Restart application (using PM2 or systemd)
echo "♻️ Restarting application..."
pm2 restart marketplace-api || pnpm start:prod

echo "✅ Deployment completed!"
