#!/bin/bash
echo "[ForgeOS] Starting local infrastructure services (Postgres, Redis, MinIO)..."
docker compose -f infrastructure/docker-compose.yml up -d

if [ $? -eq 0 ]; then
    echo "[ForgeOS] All infrastructure services are running!"
    echo "  - PostgreSQL: localhost:5432 (db: forgeos, user: forgeos)"
    echo "  - Redis:      localhost:6379"
    echo "  - MinIO S3:   localhost:9000 (Console: http://localhost:9001)"
else
    echo "[ForgeOS] Docker compose failed or Docker is not running."
    echo "ForgeOS will seamlessly fall back to built-in in-memory stores."
fi
