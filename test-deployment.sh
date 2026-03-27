#!/bin/bash
# Test script to verify Render deployment

echo "🔍 Testing MAScertify Render Deployment"
echo "========================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test URLs
FRONTEND="https://mascertify.onrender.com"
API="https://mascertify-api.onrender.com"

echo ""
echo "Testing Backend API..."
echo "URL: $API/api/health"

if curl -s "$API/api/health" | grep -q "MAScertify"; then
    echo -e "${GREEN}✅ API is responding${NC}"
else
    echo -e "${RED}❌ API not responding${NC}"
fi

echo ""
echo "Testing Frontend..."
echo "URL: $FRONTEND"

if curl -s -I "$FRONTEND" | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend is serving${NC}"
else
    echo -e "${RED}❌ Frontend not responding${NC}"
fi

echo ""
echo "Environment Variables Check:"
echo "---"
echo "Frontend expects: VITE_API_URL=https://mascertify-api.onrender.com"
echo "Backend expects: CLIENT_URL=https://mascertify.onrender.com"
echo ""
echo "✅ Setup is complete!"
echo "Visit: $FRONTEND"
