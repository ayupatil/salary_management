# Salary Management System - Frontend

React frontend for the Salary Management System.

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS (TBD)
- Shadcn/UI (TBD)
- TanStack Query (TBD)
- React Router (TBD)

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs on `http://localhost:5173`

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── employees/       # Employee-specific components
│   ├── insights/        # Insights-specific components
│   └── layout/          # Layout components
├── services/            # API client
├── hooks/               # Custom hooks
├── pages/               # Page components
├── lib/                 # Utilities
├── App.jsx              # Main app component
└── main.jsx             # Entry point
```

## Environment Variables

Create `.env.development` and `.env.production` files:

```
VITE_API_URL=http://localhost:3000
```
