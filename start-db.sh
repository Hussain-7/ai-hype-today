#!/bin/bash

# PostgreSQL Docker Container Manager for ai_hype_today
# This script will start the PostgreSQL container if it exists, or create it if it doesn't

CONTAINER_NAME="ai_hype_today_db"
DB_NAME="ai_hype_today"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_PORT="5432"

echo "🔍 Checking PostgreSQL container status..."

# Check if container exists
if [ "$(docker ps -aq -f name=^${CONTAINER_NAME}$)" ]; then
    # Check if container is running
    if [ "$(docker ps -q -f name=^${CONTAINER_NAME}$)" ]; then
        echo "✅ PostgreSQL container is already running!"
    else
        echo "▶️  Starting existing PostgreSQL container..."
        docker start ${CONTAINER_NAME}
        echo "✅ PostgreSQL container started!"
    fi
else
    echo "📦 Creating new PostgreSQL container..."
    docker run -d \
      --name ${CONTAINER_NAME} \
      -e POSTGRES_DB=${DB_NAME} \
      -e POSTGRES_USER=${DB_USER} \
      -e POSTGRES_PASSWORD=${DB_PASSWORD} \
      -p ${DB_PORT}:5432 \
      postgres:15-alpine
    echo "✅ PostgreSQL container created and started!"
fi

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Test connection
if docker exec ${CONTAINER_NAME} pg_isready -U ${DB_USER} > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready!"
    echo ""
    echo "📊 Database Information:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Container Name: ${CONTAINER_NAME}"
    echo "Database Name:  ${DB_NAME}"
    echo "Username:       ${DB_USER}"
    echo "Password:       ${DB_PASSWORD}"
    echo "Host:           localhost"
    echo "Port:           ${DB_PORT}"
    echo ""
    echo "🔗 Connection String:"
    echo "postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"
    echo ""
    echo "📝 Environment Variable (add to .env):"
    echo "DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}\""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "❌ Failed to connect to PostgreSQL"
    exit 1
fi
