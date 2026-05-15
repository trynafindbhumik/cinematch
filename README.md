# 🎬 CineMatch

CineMatch is a modern movie discovery platform built with Next.js that helps users discover, track, and review movies through an interactive swipe-based experience.

---

## ✨ Features

### 🎞️ Movie Discovery

- Swipe-based movie exploration interface
- Personalized recommendations
- Trending and curated movie feeds
- Advanced search functionality

### 👤 User Experience

- Authentication and protected routes
- Responsive design across devices
- Optimized modal and navigation flows
- Dynamic profile management

### 📚 Movie Tracking

- Watchlist management
- Watched movie history
- Favorites system
- Downloaded data support

### ⭐ Reviews & Ratings

- Add and manage movie reviews
- Review filtering and organization
- Profile review tabs
- Interactive review modals

### 🔐 Account & Session Features

- OTP-based signup flow
- Session management
- Mobile-friendly authentication
- Improved account controls

---

## 🛠️ Tech Stack

| Category        | Technology   |
| --------------- | ------------ |
| Framework       | Next.js 16   |
| UI Library      | React 19     |
| Styling         | CSS Modules  |
| Data Fetching   | SWR          |
| Validation      | Zod          |
| HTTP Client     | Axios        |
| Icons           | Lucide React |
| Package Manager | pnpm         |

---

## 📁 Project Structure

```txt
src/
├── app/
│   ├── (auth)/          # Authentication routes
│   ├── (protected)/     # Protected application pages
│   └── (public)/        # Public pages
│
├── components/
│   ├── auth/            # Authentication components
│   ├── elements/        # Shared reusable UI components
│   ├── forYou/          # Personalized feed
│   ├── home/            # Home page modules
│   ├── movieDetails/    # Movie details page
│   ├── navigation/      # Navigation system
│   ├── profile/         # User profile features
│   ├── search/          # Search functionality
│   ├── watched/         # Watched movies
│   └── watchlist/       # Watchlist management
│
├── hooks/               # Custom React hooks
├── services/            # API and external services
├── utils/               # Utility functions
└── constants/           # Shared constants
```

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone git@github.com:trynafindbhumik/cinematch.git
cd cinematch
```

### 2️⃣ Install dependencies

```bash
pnpm install
```

### 3️⃣ Start the development server

```bash
pnpm run dev
```

Open:

```txt
http://localhost:3000
```

---

## 📜 Available Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `pnpm run dev`    | Start development server         |
| `pnpm run build`  | Build application for production |
| `pnpm run start`  | Start production server          |
| `pnpm run lint`   | Run ESLint                       |
| `pnpm run format` | Format code with Prettier        |

---

## 🧹 Code Quality

This project includes:

- ESLint configuration
- Prettier formatting
- CI workflow support
- Consistent folder structure
- Reusable component architecture

---

## 🌐 Learn More

- :contentReference[oaicite:0]{index=0}
- :contentReference[oaicite:1]{index=1}
- :contentReference[oaicite:2]{index=2}
- :contentReference[oaicite:3]{index=3}

---

## 📌 Status

CineMatch is actively under development with ongoing improvements to:

- recommendation systems
- review experiences
- UI/UX polish
- performance optimization
- profile personalization
