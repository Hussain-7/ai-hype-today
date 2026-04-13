# AI Hype Today

AI Hype Today is a Next.js platform for tracking new AI products, launches, and major updates across curated sources. It combines a public-facing news experience with an authenticated admin workflow for ingesting, reviewing, and managing articles at scale.

## Highlights

- Aggregates AI news and product updates from multiple sources
- Uses AI-assisted extraction to normalize titles, summaries, and company data
- Includes protected admin flows for running and monitoring ingestion jobs
- Stores articles and source data with Prisma and PostgreSQL
- Uses Inngest for background workflows and scheduled processing

## Tech Stack

- Next.js 16
- React 19
- Clerk
- Prisma
- PostgreSQL
- Inngest
- Tavily
- TypeScript

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy your example file and fill in the required secrets for the app, database, authentication, and pipeline providers.

```bash
cp .env.example .env.local
```

### 3. Prepare the database

```bash
pnpm db:migrate
pnpm db:seed
```

If you are running the local database helpers included in the repo:

```bash
pnpm db:start
pnpm db:stop
```

### 4. Start the app

```bash
pnpm dev
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm check
pnpm db:migrate
pnpm db:seed
pnpm db:studio
```

## Documentation

- [Dashboard notes](./DASHBOARD.md)
- [Database notes](./DATABASE.md)

## Roadmap

- Improve production pipeline completion behavior
- Let users add and manage their own tracked sources
- Persist company and source preferences per user
- Add subscriptions for daily update delivery
- Expand the platform beyond AI-specific tracking

## License

MIT
