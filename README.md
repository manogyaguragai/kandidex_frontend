# Kandidex Frontend

Kandidex is an AI-powered recruitment platform designed to remove bias, reduce time-to-hire, and connect talent with forward-thinking companies. This repository contains the frontend application built with React, TypeScript, and Vite.

## Features

- **AI Recruitment**: Intelligent resume screening and candidate ranking.
- **Unbiased Hiring**: Focus on skills and experience, ignoring demographic factors.
- **Modern UI**: Polished, responsive interface using Tailwind CSS and Radix UI.
- **Interactive Elements**: Smooth animations with Framer Motion.

## Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) / [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) / [React Query](https://tanstack.com/query/latest)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd kandidex_frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### Building for Production

Build the application for deployment:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
src/
├── api/          # API integration and services
├── components/   # Reusable UI components
│   ├── landing/  # Landing page specific components
│   ├── layout/   # Layout components (Navbar, Footer, etc.)
│   └── ui/       # Core UI primitives (Buttons, Cards, etc.)
├── lib/          # Utilities and helper functions
├── pages/        # Route pages
└── store/        # State management stores
```

## License

[MIT](LICENSE)
