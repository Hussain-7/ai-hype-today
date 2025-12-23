# AI Hype Today - Dashboard

## Overview

A comprehensive dashboard for managing the AI news aggregation pipeline and viewing results in real-time.

## Features

### 1. Pipeline Control
- **Trigger Button**: Start the pipeline to fetch latest AI news from all 50 sources
- **Status Indicator**: Shows if pipeline is currently running
- **Error Messages**: Displays any errors that occur during pipeline execution

### 2. Real-Time Status Updates
- **Auto-Polling**: Automatically polls job status every 2 seconds while running
- **Progress Bar**: Visual progress indicator showing completion percentage
- **Live Stats**:
  - Processed companies (X/50)
  - Successful fetches
  - Articles found
  - Articles saved

### 3. Recent Pipeline Jobs
- Table view of last 5 pipeline executions
- Status badges (Pending, Running, Completed, Failed)
- Progress tracking
- Article count
- Start time

### 4. Latest AI News
- Display of 20 most recent articles
- Company badges with color-coded dominance levels:
  - **Purple**: Dominant (OpenAI, Anthropic, etc.)
  - **Blue**: Major (xAI, Mistral, etc.)
  - **Green**: Tooling (Cursor, Windsurf, etc.)
  - **Orange**: Ecosystem
- Article metadata:
  - Title with external link
  - Description
  - Publication date
  - Company name

## API Endpoints Used

### Trigger Pipeline
```
POST /api/pipeline/trigger
Body: { triggeredBy: "dashboard" }
```

### Get Job Status
```
GET /api/pipeline/status/[jobId]
```

### Get Recent Jobs
```
GET /api/jobs?limit=5
```

### Get Recent Articles
```
GET /api/articles?limit=20
```

## Technology Stack

- **Next.js 16** with App Router
- **React 19** with Client Components
- **TailwindCSS 4** for styling
- **date-fns** for date formatting
- **Real-time polling** for status updates

## Usage

1. **Start the Development Server**:
   ```bash
   pnpm dev
   ```

2. **Open Dashboard**:
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Trigger Pipeline**:
   - Click the "Trigger Pipeline" button
   - Watch real-time progress updates
   - See articles populate as they're fetched

4. **View Results**:
   - Scroll down to see latest articles
   - Click article titles to open in new tab
   - Filter by company using the visual badges

## Features in Detail

### Auto-Refresh
- Jobs table refreshes when pipeline completes
- Articles list updates automatically
- Status polls every 2 seconds during execution

### Error Handling
- Graceful error messages for API failures
- Prevents multiple simultaneous pipeline runs
- Shows clear error states in UI

### Responsive Design
- Mobile-friendly layout
- Grid-based responsive stats cards
- Adaptive navigation and spacing

## Dashboard States

1. **Idle**: Ready to trigger new pipeline
2. **Running**: Shows live progress and stats
3. **Completed**: Displays final results with refresh
4. **Error**: Shows error message with retry option

## Color Scheme

- **Background**: Gradient gray with dark mode support
- **Cards**: White/Dark gray with shadow
- **Accents**: Blue for actions, Green for success, Red for errors
- **Badges**: Color-coded by company importance

## Performance

- Optimized polling (2-second intervals)
- Lazy loading of article images
- Efficient state management
- Minimal re-renders

## Future Enhancements

Potential features to add:
- [ ] Pagination for articles
- [ ] Search and filter functionality
- [ ] Export results to CSV/JSON
- [ ] Schedule pipeline runs
- [ ] Email notifications on completion
- [ ] Analytics dashboard
- [ ] Company-specific views
- [ ] Date range filtering
