# Kubrik Admin Dashboard

Administration panel for the [Kubrik](../kubrik.frontend/) platform by **StudioBlo**.

Provides user management, analytics, and system administration for the Kubrik AI-powered movie pre-production platform.

## Features

- **Dashboard** -- Overview of platform metrics and activity
- **User Management** -- Create, edit, and manage user accounts
- **User Analytics** -- Usage statistics and engagement metrics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 (SWC) |
| Styling | Tailwind CSS + shadcn/ui |
| State | TanStack Query v5 |
| Routing | React Router 6 |
| Charts | Recharts |

## Prerequisites

- **Node.js** 18+ and npm
- **Running backend API** -- see [kubrik_backend](../kubrik_backend/)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server (port 8080)
npm run dev
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8001/api/v1
VITE_APP_NAME=Kubrik Admin
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend API base URL (with `/api/v1` prefix) |
| `VITE_APP_NAME` | No | Application display name |

## Project Structure

```
src/
  App.tsx              # Root component with routing
  main.tsx             # Entry point
  components/
    ui/                # shadcn/ui primitives
  pages/
    Login.tsx          # Admin login
    admin/
      Dashboard.tsx    # Main dashboard with metrics
      UserManagement.tsx
      UserAnalytics.tsx
      CreateUser.tsx
  contexts/            # React contexts (auth, theme)
  hooks/               # Custom hooks
  lib/                 # Utilities
  utils/               # Helper functions
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Docker Deployment

The admin dashboard runs as the `frontend_admin` service in Docker Compose on port 8083. See the root [docker-compose.yml](../docker-compose.yml).

## License

Proprietary -- StudioBlo. All rights reserved.
