# Madden NFL Salary Explorer Frontend

Modern React frontend for exploring Madden NFL team and player salary cap data.

## Features

- **Team Salary Cap View** - Browse all 32 NFL teams with cap room, spent, and available information
- **Team Search** - Find teams by name or abbreviation (case-insensitive, partial matching)
- **Player Search** - Search for players by first or last name
- **Player Details** - View comprehensive salary and contract information for individual players
- **Status Badges** - See player status (Active, IR, Free Agent, Practice Squad)
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Modern UI** - Built with shadcn/ui components and Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will open at `http://localhost:3000` and proxy API calls to `http://localhost:8000`.

3. Build for production:
```bash
npm run build
```

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Axios** - HTTP client
- **Radix UI** - Unstyled, accessible components

## API Integration

The frontend communicates with the FastAPI backend at `http://localhost:8000`. Make sure the backend is running before starting the development server.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   ├── pages/            # Page components
│   ├── lib/
│   │   ├── api.ts        # API client
│   │   └── utils.ts      # Utility functions
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── package.json          # Dependencies
```
