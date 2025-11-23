#!/bin/bash

# Quick status check script

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Checking Bitcoin POS System Status..."
echo ""

# Check Docker
echo -n "Docker: "
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
fi

# Check PostgreSQL container
echo -n "PostgreSQL Container: "
if docker ps | grep -q bitcoin_pos_postgres; then
    echo -e "${GREEN}✅ Running${NC}"
    docker ps | grep bitcoin_pos_postgres | awk '{print "   Port: " $NF}'
else
    echo -e "${RED}❌ Not running${NC}"
fi

# Check Backend API
echo -n "Backend API (port 3001): "
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
    echo "   Health: $(curl -s http://localhost:3001/health | head -1)"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

# Check Vendor Dashboard
echo -n "Vendor Dashboard (port 5173): "
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

# Check .env file
echo -n ".env file: "
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ Exists${NC}"
    if grep -q "5433" backend/.env; then
        echo -e "   ${GREEN}✅ Using correct port (5433)${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Port may be incorrect${NC}"
    fi
else
    echo -e "${RED}❌ Missing${NC}"
fi

# Test login
echo -n "API Login Test: "
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"vendor@example.com","password":"password123"}' 2>&1)
if echo "$RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
    echo "   Response: $RESPONSE"
fi

echo ""
echo "📍 URLs:"
echo "   • Vendor Dashboard: http://localhost:5173"
echo "   • Backend API: http://localhost:3001"
echo "   • API Health: http://localhost:3001/health"
echo ""
echo "👤 Demo Accounts:"
echo "   • Vendor: vendor@example.com / password123"
echo "   • Customer: customer@example.com / password123"

