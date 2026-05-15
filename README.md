# CineMatch

A movie discovery platform with a swipe-based UI for finding your next favorite film.

## Features

- **Swipe to Discover** — Browse movies with a Tinder-style card interface
- **Personalized For You** — Recommendations tailored to your taste
- **Watchlist** — Save movies you want to see
- **Watched History** — Track movies you've already seen
- **Reviews** — Rate and review movies
- **User Profiles** — View your movie statistics and activity

## Tech Stack

- **Framework:** Next.js 16 with React 19
- **Styling:** CSS Modules
- **Data Fetching:** SWR
- **Validation:** Zod
- **HTTP Client:** Axios
- **Icons:** Lucide React

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Authentication pages
│   ├── (protected)/  # Protected routes (profile, etc.)
│   └── (public)/     # Public pages
├── components/
│   ├── auth/         # Auth components
│   ├── elements/     # Reusable UI elements
│   ├── forYou/       # For You feed
│   ├── home/         # Home page components
│   ├── movieDetails/ # Movie detail view
│   ├── navigation/   # Navigation components
│   ├── profile/      # Profile pages
│   ├── search/       # Search functionality
│   ├── watchlist/    # Watchlist components
│   └── watched/      # Watched history
└── hooks/            # Custom React hooks
```

## Available Scripts

| Command           | Description               |
| ----------------- | ------------------------- |
| `pnpm run dev`    | Start development server  |
| `pnpm run build`  | Build for production      |
| `pnpm run start`  | Start production server   |
| `pnpm run lint`   | Run ESLint                |
| `pnpm run format` | Format code with Prettier |

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
