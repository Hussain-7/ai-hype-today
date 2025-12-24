This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Next Up
- [x] When the pipeline is triggered  it fetch all the latest artciles from the sources. The first time for a source all articles should be fetched the next time it runs it should fetch articles for the previous day and current day only (some prompt edits to tell this specifically)
- [x] Add inggest keys to be able to deploy.
- [x] Add remote postgress db so that we can use it on prod.
- [x] From admin panle we should be able to trigger pipeline for a soruce to fetch all from source or fetch for specific ranges and add.
- [x] Add login sign up via clerk. So that admin routes are protected.
- [ ] Fix pipeline in prod not ending on total articles fetched. Fetching starts again and fetches more than total companies.
- [ ] Give users abilty to add new sources so they can track new companies and articles.
- [ ] Persist the user's selected companies and sources so they are persisted in the database.
- [ ] Add a way to subscribe to the daily updates via email to the users.
- [ ] Add a way in the intial signup to white list the companies they want to track from the sources we have. So people only see what they need
- [ ] The sources people add will be added to there if ai approaved and is official and very good we can add to global in the db else for user specific only. 
- [ ] Status update view
- [ ] Add an agent when we interact to an article via the agent the agent will fetch all the details related to article and give a summary of the article. We'll cache summaries in the redis or the database.
- [ ] Expand this in a way so that it can be used for not just ai other product and companies as well so the ai preference can all be selected from the ui layor rather that the db.
- [ ] Add proper pagination and searching from articles because once total reaches 1000 we need to add pagination and searching.
- [ ] Improve on url fetching for article ensure we are able to fetch properly