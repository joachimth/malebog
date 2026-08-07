# Digital Coloring Book (Malebog)

## Overview

A digital coloring book web application designed for children aged 4-16. Users can browse a gallery of motifs organized by categories, color them using various drawing tools (brush, eraser, fill, color picker), and save their creations locally. The app is touch-friendly, works across mobile/tablet/desktop, and stores all user drawings in the browser using IndexedDB.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **UI Components**: Shadcn/UI component library built on Radix primitives
- **Styling**: Tailwind CSS with custom playful color palette and CSS variables
- **Animations**: Framer Motion for transitions and micro-interactions
- **Fonts**: 'Architects Daughter' for headings, 'DM Sans' for body text

### Backend Architecture
- **Runtime**: Node.js with Express
- **Build Tool**: Vite for frontend, esbuild for server bundling
- **API Structure**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Development**: Hot module replacement via Vite middleware

### Data Storage
- **Server Database**: PostgreSQL with Drizzle ORM
  - Stores motif catalog (title, category, imageUrl, tags)
  - Schema defined in `shared/schema.ts`
- **Client Storage**: IndexedDB via `idb` library
  - Stores user drawings as Blobs with thumbnails
  - Enables offline-first functionality for saved work

### Key Design Patterns
- **Shared Schema**: Types and validation schemas shared between client and server via `@shared/*` path alias
- **Type-Safe API**: Route definitions include Zod schemas for request/response validation
- **Component-Driven**: Modular UI components with variants using class-variance-authority
- **Monorepo Structure**: Single package with `client/`, `server/`, and `shared/` directories

### Drawing Editor
- HTML5 Canvas for coloring interface
- Tools: Brush, Eraser, Flood Fill, Color Picker (Pipette)
- Features: Undo/Redo history, brush size control, preset color palette with custom color picker
- Touch support for mobile devices via pointer events
- Canvas initialization uses ResizeObserver to handle layout timing
- Motif data loaded from cached list via useMemo for better performance

## External Dependencies

### Database
- **PostgreSQL**: Primary database for motif storage
- **Drizzle ORM**: Type-safe database queries and migrations

### Frontend Libraries
- **react-colorful**: Color picker component for drawing tools
- **idb**: IndexedDB wrapper for storing user drawings locally
- **framer-motion**: Animation library for UI transitions
- **date-fns**: Date formatting utilities (with Danish locale support)
- **uuid**: Generating unique IDs for saved drawings

### UI Framework
- **Radix UI**: Accessible primitive components (dialogs, popovers, tooltips, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server-side bundling for production
- **TypeScript**: Type checking across the entire codebase