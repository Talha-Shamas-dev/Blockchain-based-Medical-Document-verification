#!/bin/bash
echo "==> Stopping all Fabric containers..."
docker stop $(docker ps -a -q --filter="name=peer" --filter="name=orderer" --filter="name=ca") 2>/dev/null || true
docker rm -f $(docker ps -a -q --filter="name=peer" --filter="name=orderer" --filter="name=ca") 2>/dev/null || true
echo "==> Removing dev-chaincode images..."
docker rmi -f $(docker images dev-* -q) 2>/dev/null || true
echo "==> Pruning volumes and network..."
docker volume prune -f
docker network rm fabric_test 2>/dev/null || true
echo "==> Removing local ledger and artifacts (dev, channel-artifacts)..."
rm -rf dev channel-artifacts
echo "==> Done. All clean."
