#!/bin/bash

# Stop PostgreSQL Docker Container for ai_hype_today

CONTAINER_NAME="ai_hype_today_db"

echo "🛑 Stopping PostgreSQL container..."

if [ "$(docker ps -q -f name=^${CONTAINER_NAME}$)" ]; then
    docker stop ${CONTAINER_NAME}
    echo "✅ PostgreSQL container stopped!"
else
    echo "ℹ️  PostgreSQL container is not running"
fi
