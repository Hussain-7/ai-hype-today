# Claude Development Guidelines for ai-hype-today

## ⚠️ IMPORTANT: Always Run Checks After Changes

### Required Checks Before Completing Any Task:

1. **Lint Check** (MANDATORY):
   ```bash
   pnpm lint
   ```
   - Must pass with no errors
   - Fix all TypeScript type errors
   - Address all linting warnings

2. **Build Check** (MANDATORY):
   ```bash
   pnpm build
   ```
   - Must compile successfully
   - Verify no TypeScript compilation errors
   - Check for any warnings

3. **Format Code**:
   ```bash
   pnpm format
   ```
   - Ensure consistent code formatting
   - Apply Biome formatting rules

## Workflow Checklist

For every code change:
- [ ] Make the changes
- [ ] Run `pnpm lint` - Fix all errors
- [ ] Run `pnpm build` - Ensure successful build
- [ ] Run `pnpm format` - Format code
- [ ] Test the feature manually
- [ ] Document changes if significant

## Project-Specific Rules

### 1. Type Safety
- Always use proper TypeScript types
- Avoid `any` unless absolutely necessary (document why)
- Use null checks for optional data
- Validate API responses before using

### 2. Error Handling
- Add try-catch blocks for async operations
- Set default empty states on error
- Log errors with context
- Show user-friendly error messages

### 3. API Endpoints
- Validate request/response
- Return proper HTTP status codes
- Handle edge cases (empty data, null values)
- Add proper TypeScript types

### 4. React Components
- Use client components when needed ('use client')
- Handle loading states
- Add null checks for props
- Use proper TypeScript interfaces

### 5. Database (Prisma)
- Use the adapter pattern (required for Prisma 7)
- Cast JSON fields as `any` when needed
- Always check database connection
- Use transactions for multiple operations

### 6. Styling
- Use Tailwind CSS classes
- Follow existing color scheme
- Ensure dark mode support
- Test responsive layouts

## Common Issues & Solutions

### Issue: TypeScript Errors in Build
**Solution:**
1. Run `pnpm lint` to see specific errors
2. Fix type definitions
3. Add null checks where needed
4. Use proper type casting when necessary

### Issue: Prisma Client Errors
**Solution:**
1. Ensure `@prisma/adapter-pg` is installed
2. Verify `DATABASE_URL` in `.env.local`
3. Check adapter configuration in `src/lib/prisma.ts`
4. Run `pnpm db:start` to ensure database is running

### Issue: API Returns Undefined
**Solution:**
1. Add null checks: `data.field || []`
2. Validate response status: `if (!res.ok) throw Error`
3. Set default empty states
4. Handle errors in catch blocks

### Issue: Hydration Errors
**Solution:**
1. Usually cosmetic, check if functional
2. Ensure no dynamic data in SSR components
3. Use `suppressHydrationWarning` if needed
4. Move dynamic content to client components

## Environment Setup

### Required Environment Variables (.env.local):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_hype_today"
TAVILY_API_KEY="your_key"
GOOGLE_GENERATIVE_AI_API_KEY="your_key"
```

### Database Management:
```bash
npm run db:start    # Start PostgreSQL container
npm run db:stop     # Stop container
npm run db:migrate  # Run migrations
npm run db:studio   # Open Prisma Studio
```

## Testing Checklist

Before marking task complete:
- [ ] Lint passes
- [ ] Build succeeds
- [ ] Code is formatted
- [ ] Manual testing done
- [ ] Error cases handled
- [ ] Types are correct
- [ ] Database works (if applicable)
- [ ] API endpoints tested (if applicable)

## Git Commit Guidelines

- Keep commits focused and atomic
- Write clear commit messages
- Test before committing
- Run lint and build before pushing

## Documentation

Update relevant docs when:
- Adding new features
- Changing API endpoints
- Modifying database schema
- Adding environment variables
- Changing configuration

## Performance Considerations

- Use React.memo() for expensive components
- Optimize database queries
- Add proper indexes
- Use pagination for large datasets
- Implement proper caching strategies

## Security Checklist

- Validate all user input
- Sanitize data before database operations
- Use environment variables for secrets
- Implement proper error handling
- Add rate limiting for API endpoints (future)
- Use HTTPS in production

---

**Remember: ALWAYS run `pnpm lint` and `pnpm build` after making changes!**
