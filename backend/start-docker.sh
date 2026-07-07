#!/bin/bash
echo "🚀 Starting MedChain Docker Services..."

# 1. Start Redis
docker run -d --name medchain-redis -p 6379:6379 redis:7-alpine

# 2. Build and start backend
docker build -t medchain-backend .
docker run -d --name medchain-backend \
  -p 4000:4000 \
  -v $(pwd)/medchain.db:/app/medchain.db \
  -v ${HOME}/fabric-new/test-network/organizations:/app/organizations \
  --network host \
  medchain-backend

# 3. Build and start frontend
cd ../medical-frontend
docker build -t medchain-frontend .
docker run -d --name medchain-frontend \
  -p 3000:80 \
  medchain-frontend

echo "✅ All services started!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000"
echo "   Redis:    localhost:6379"
