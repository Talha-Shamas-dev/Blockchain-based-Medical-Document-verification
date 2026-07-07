#!/bin/bash
echo "🛑 Stopping MedChain Docker Services..."
docker stop medchain-frontend medchain-backend medchain-redis 2>/dev/null || true
docker rm medchain-frontend medchain-backend medchain-redis 2>/dev/null || true
echo "✅ All services stopped."
