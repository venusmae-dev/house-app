# Haus

A React + TypeScript app for browsing house listings.

## Tech Stack

- React + TypeScript
- Vite
- shadcn/ui + Tailwind CSS
- CSS Modules
- Native Fetch API

## Features

- Infinite scroll powered by the Intersection Observer API
- Automatic retry on failed API requests with spinner feedback
- Favorite and unfavorite listings - persisted in memory during the session
- Responsive layout - sidebar nav on desktop, top nav on mobile
- House listings are deduplicated by ID before being appended to the list

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm

### Installation

```bash
npm install
```

### Running the app

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other commands

```bash
npm run build    # Build for production
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

## Architecture

The app fetches paginated house data from an API. Infinite scroll is implemented using the native Intersection Observer API - when the bottom of the list enters the viewport, the next page is fetched and appended. Failed requests retry automatically after 1.5 seconds without losing previously loaded data.

Listings can be favorited and unfavorited. Favorites state is lifted to `App.tsx` and shared between components via props. A state management library was not introduced since the app scope does not require one, though it would be a natural next step as the app grows.
