# PostgreSQL Database Setup

This project uses PostgreSQL running in Docker for local development.

## Quick Start

### Start the database:
```bash
npm run db:start
# or
./start-db.sh
```

### Stop the database:
```bash
npm run db:stop
# or
./stop-db.sh
```

## Database Information

- **Container Name:** `ai_hype_today_db`
- **Database Name:** `ai_hype_today`
- **Username:** `postgres`
- **Password:** `postgres`
- **Host:** `localhost`
- **Port:** `5432`

## Connection String

```
postgresql://postgres:postgres@localhost:5432/ai_hype_today
```

This is already configured in `.env.local` as `DATABASE_URL`.

## Available npm Scripts

- `npm run db:start` - Start PostgreSQL container (creates if doesn't exist)
- `npm run db:stop` - Stop PostgreSQL container
- `npm run db:migrate` - Run Prisma migrations
- `npm run db:reset` - Reset database (drops all data)
- `npm run db:studio` - Open Prisma Studio (GUI for database)

## Prisma Commands

### Generate Prisma Client:
```bash
npx prisma generate
```

### Create a migration:
```bash
npx prisma migrate dev --name your_migration_name
```

### Apply migrations:
```bash
npx prisma migrate deploy
```

### Reset database:
```bash
npx prisma migrate reset
```

### Open Prisma Studio:
```bash
npx prisma studio
```

## Docker Commands (Manual)

If you need to manage the container manually:

### View logs:
```bash
docker logs ai_hype_today_db
```

### Access PostgreSQL shell:
```bash
docker exec -it ai_hype_today_db psql -U postgres -d ai_hype_today
```

### Stop and remove container:
```bash
docker stop ai_hype_today_db
docker rm ai_hype_today_db
```

### View running containers:
```bash
docker ps
```

## Troubleshooting

### Port 5432 already in use
If you get a port conflict error, either:
1. Stop any other PostgreSQL instance running on port 5432
2. Or modify the `start-db.sh` script to use a different port (e.g., `-p 5433:5432`)

### Container already exists but won't start
```bash
docker rm ai_hype_today_db
npm run db:start
```

### Reset everything (nuclear option)
```bash
docker stop ai_hype_today_db
docker rm ai_hype_today_db
docker volume prune -f
npm run db:start
npm run db:migrate
```

## Notes

- The database data persists even when the container is stopped
- The container will automatically restart unless explicitly stopped
- The `start-db.sh` script is idempotent - safe to run multiple times
