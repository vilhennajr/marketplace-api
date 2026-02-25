#!/usr/bin/env pwsh

# Windows PowerShell script to start the project

Write-Host "🚀 Marketplace API - Quick Start" -ForegroundColor Green
Write-Host ""

# Check if pnpm is installed
Write-Host "📦 Checking pnpm..." -ForegroundColor Yellow
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm not found. Installing..." -ForegroundColor Red
    npm install -g pnpm
}
Write-Host "✅ pnpm found" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host ""
    Write-Host "⚙️ Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env created" -ForegroundColor Green
}

# Check if Docker is running
Write-Host ""
Write-Host "🐳 Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Start Docker containers
Write-Host ""
Write-Host "🐳 Starting PostgreSQL and Redis..." -ForegroundColor Yellow
docker-compose up -d

# Wait for database
Write-Host ""
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Generate Prisma Client
Write-Host ""
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
pnpm prisma:generate

# Run migrations
Write-Host ""
Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
pnpm prisma:migrate

# Seed database
Write-Host ""
$seed = Read-Host "Do you want to seed the database with sample data? (Y/n)"
if ($seed -eq "" -or $seed -eq "y" -or $seed -eq "Y") {
    Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
    pnpm prisma:seed
    Write-Host "✅ Database seeded" -ForegroundColor Green
    Write-Host ""
    Write-Host "👤 Admin credentials:" -ForegroundColor Cyan
    Write-Host "   Email: admin@marketplace.com" -ForegroundColor White
    Write-Host "   Password: admin123" -ForegroundColor White
}

# Start application
Write-Host ""
Write-Host "🚀 Starting application..." -ForegroundColor Green
Write-Host ""
Write-Host "📚 Documentation will be available at:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000/api/docs" -ForegroundColor White
Write-Host ""

pnpm start:dev
