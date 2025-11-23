#!/bin/bash

# Bitcoin POS System - Automated Startup Script
# This script sets up and starts all components of the system

# Don't exit on error - we want to handle errors gracefully
set +e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Bitcoin POS System - Starting Setup...${NC}\n"

# Check if Docker is running (only needed if using local PostgreSQL)
# We'll check this later if needed

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js is installed ($(node --version))${NC}\n"

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Step 1: Backend Setup
echo -e "${YELLOW}🔧 Setting up Backend...${NC}"
cd "$SCRIPT_DIR/backend"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}  Please create backend/.env file with your Supabase credentials${NC}"
    echo -e "${YELLOW}  See SUPABASE_SETUP.md for instructions${NC}"
    echo ""
    echo -e "${YELLOW}  Example .env file:${NC}"
    echo "  DATABASE_URL=\"postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres\""
    echo "  JWT_SECRET=\"your-super-secret-jwt-key\""
    echo "  PORT=3001"
    echo "  NODE_ENV=development"
    exit 1
fi

# Check if DATABASE_URL contains supabase or localhost
if grep -q "supabase" .env 2>/dev/null || ! grep -q "localhost" .env 2>/dev/null; then
    echo -e "${GREEN}  → Using Supabase database (no Docker needed)${NC}"
    USE_DOCKER=false
else
    echo -e "${YELLOW}  → Using local PostgreSQL with Docker...${NC}"
    USE_DOCKER=true
    
    # Stop any existing containers first
    echo -e "${YELLOW}  → Stopping any existing containers...${NC}"
    docker-compose down 2>/dev/null || true
    
    # Start PostgreSQL
    echo -e "${YELLOW}  → Starting PostgreSQL with Docker...${NC}"
    docker-compose up -d
    sleep 5  # Wait for PostgreSQL to be ready
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}  → Installing backend dependencies...${NC}"
    npm install
fi

# Generate Prisma client
echo -e "${YELLOW}  → Generating Prisma client...${NC}"
npm run db:generate

# Wait for database to be ready (only for Docker)
if [ "$USE_DOCKER" = true ]; then
    echo -e "${YELLOW}  → Waiting for database to be ready...${NC}"
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U bitcoin_pos_user > /dev/null 2>&1; then
            echo -e "${GREEN}    Database is ready${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}    Database failed to start${NC}"
            exit 1
        fi
        sleep 1
    done
else
    echo -e "${GREEN}    Using Supabase (cloud database)${NC}"
fi

# Run migrations
echo -e "${YELLOW}  → Running database migrations...${NC}"
npm run db:migrate || echo -e "${YELLOW}    Migration may have already been applied${NC}"

# Seed database (optional, but helpful for demo)
echo -e "${YELLOW}  → Seeding database with demo data...${NC}"
npm run db:seed || echo -e "${YELLOW}    Database may already be seeded${NC}"

echo -e "${GREEN}✅ Backend setup complete${NC}\n"

# Step 2: Vendor Dashboard Setup
echo -e "${YELLOW}🎨 Setting up Vendor Dashboard...${NC}"
cd "$SCRIPT_DIR/vendor-dashboard"

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}  → Installing vendor dashboard dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}✅ Vendor dashboard setup complete${NC}\n"

# Step 3: Start services
echo -e "${GREEN}🚀 Starting services...${NC}\n"

# Start backend in background
echo -e "${YELLOW}  → Starting backend server (http://localhost:3001)...${NC}"
cd "$SCRIPT_DIR/backend"
npm run dev > /tmp/bitcoin-pos-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}    Backend started (PID: $BACKEND_PID)${NC}"

# Wait a bit for backend to start
sleep 3

# Start vendor dashboard in background
echo -e "${YELLOW}  → Starting vendor dashboard (http://localhost:5173)...${NC}"
cd "$SCRIPT_DIR/vendor-dashboard"
npm run dev > /tmp/bitcoin-pos-vendor.log 2>&1 &
VENDOR_PID=$!
echo -e "${GREEN}    Vendor dashboard started (PID: $VENDOR_PID)${NC}"

# Wait a bit for vendor dashboard to start
sleep 3

# Open browser tabs
echo -e "\n${YELLOW}🌐 Opening browser tabs...${NC}"
sleep 2
open "http://localhost:5173" 2>/dev/null || echo "  → Vendor Dashboard: http://localhost:5173"
open "http://localhost:3001/health" 2>/dev/null || echo "  → Backend API: http://localhost:3001/health"

# Open static HTML file
if [ -f "$SCRIPT_DIR/Website/transactionhistory.html" ]; then
    open "$SCRIPT_DIR/Website/transactionhistory.html" 2>/dev/null || echo "  → Transaction History: $SCRIPT_DIR/Website/transactionhistory.html"
fi

echo -e "\n${GREEN}✅ All services are running!${NC}\n"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📍 Services:${NC}"
echo -e "   • Backend API:     http://localhost:3001"
echo -e "   • Vendor Dashboard: http://localhost:5173"
echo -e "   • Transaction History: Website/transactionhistory.html"
echo -e "\n${GREEN}👤 Demo Accounts (after seeding):${NC}"
echo -e "   • Customer: customer@example.com / password123"
echo -e "   • Vendor:   vendor@example.com / password123"
echo -e "\n${YELLOW}📝 Logs:${NC}"
echo -e "   • Backend: tail -f /tmp/bitcoin-pos-backend.log"
echo -e "   • Vendor:  tail -f /tmp/bitcoin-pos-vendor.log"
echo -e "\n${YELLOW}⏹️  To stop all services, run:${NC}"
echo -e "   ./stop.sh"
echo -e "   or manually kill PIDs: $BACKEND_PID $VENDOR_PID"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Save PIDs to file for stop script
echo "$BACKEND_PID $VENDOR_PID" > /tmp/bitcoin-pos-pids.txt

# Keep script running and show logs
echo -e "${YELLOW}Press Ctrl+C to stop all services...${NC}\n"
trap "echo -e '\n${YELLOW}Stopping services...${NC}'; kill $BACKEND_PID $VENDOR_PID 2>/dev/null; docker-compose -f $SCRIPT_DIR/backend/docker-compose.yml down; exit" INT TERM

# Tail logs
tail -f /tmp/bitcoin-pos-backend.log /tmp/bitcoin-pos-vendor.log 2>/dev/null || wait

