#!/bin/bash

# Bitcoin POS System - Stop Script
# This script stops all running services

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping Bitcoin POS System...${NC}\n"

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Stop processes from PID file
if [ -f /tmp/bitcoin-pos-pids.txt ]; then
    PIDS=$(cat /tmp/bitcoin-pos-pids.txt)
    for PID in $PIDS; do
        if kill -0 $PID 2>/dev/null; then
            echo -e "${YELLOW}  → Stopping process $PID...${NC}"
            kill $PID 2>/dev/null || true
        fi
    done
    rm /tmp/bitcoin-pos-pids.txt
fi

# Stop Docker containers
echo -e "${YELLOW}  → Stopping Docker containers...${NC}"
cd "$SCRIPT_DIR/backend"
docker-compose down 2>/dev/null || true

# Clean up log files
rm -f /tmp/bitcoin-pos-backend.log /tmp/bitcoin-pos-vendor.log

echo -e "${GREEN}✅ All services stopped${NC}\n"

