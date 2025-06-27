# Coptic Patriarchs Database

## Overview

This is a full-stack web application dedicated to documenting and showcasing the Coptic Orthodox Church Patriarchs throughout history. The application serves as a comprehensive database featuring biographical information, historical contributions, and the heresies fought by each patriarch. Built with a modern tech stack, it provides both public viewing and administrative management capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: Arabic-first design with RTL support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (Neon serverless)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with proper HTTP status codes

### Build System
- **Build Tool**: Vite for fast development and optimized production builds
- **TypeScript**: Shared types between client and server
- **Module System**: ES modules throughout the stack
- **Development**: Hot module replacement with Vite dev server

## Key Components

### Database Schema
Located in `shared/schema.ts`, the schema defines three main tables:

1. **Sessions Table**: Stores user session data for authentication
2. **Users Table**: Stores user profiles from Replit Auth
3. **Patriarchs Table**: Core entity containing:
   - Basic information (name, order number, years of service)
   - Historical categorization by era
   - Biographical details and contributions
   - Array of heresies fought against
   - Active status for content management

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Authorization**: Route-level protection for admin functions
- **User Management**: Automatic user creation and profile updates

### API Structure
RESTful endpoints organized by functionality:

- **Public Routes**: 
  - `GET /api/patriarchs` - List patriarchs with filtering
  - `GET /api/patriarchs/:id` - Individual patriarch details
- **Protected Routes**:
  - `GET /api/auth/user` - Current user profile
  - `POST /api/admin/patriarchs` - Create patriarch
  - `PUT /api/admin/patriarchs/:id` - Update patriarch
  - `DELETE /api/admin/patriarchs/:id` - Delete patriarch
  - `GET /api/admin/stats` - Dashboard statistics

### UI Components
- **Public Interface**: Landing page with search, filtering, and timeline views
- **Admin Interface**: Full CRUD operations with form validation
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Arabic Typography**: Custom fonts (Noto Sans Arabic, Amiri) for proper Arabic rendering

## Data Flow

1. **Public Access**: Users can browse patriarchs, search by name/era, and view detailed information
2. **Authentication**: Admin users authenticate via Replit Auth
3. **Content Management**: Authenticated users can create, edit, and delete patriarch records
4. **Real-time Updates**: TanStack Query provides optimistic updates and cache invalidation
5. **Search & Filtering**: Server-side filtering by era, heresies fought, and text search

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL adapter
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **zod**: Runtime type validation and schema validation

### Authentication
- **openid-client**: OpenID Connect client for Replit Auth
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Production server bundling

## Deployment Strategy

### Development
- **Local Development**: `npm run dev` starts both client and server with HMR
- **Database**: Uses Neon serverless PostgreSQL with connection pooling
- **Environment**: Requires `DATABASE_URL` and session secrets

### Production Build
- **Client**: Vite builds optimized React app to `dist/public`
- **Server**: esbuild bundles Node.js server to `dist/index.js`
- **Deployment**: Single process serving both static files and API

### Database Management
- **Schema Evolution**: Drizzle Kit for migrations in `migrations/` directory
- **Push Strategy**: `npm run db:push` for development schema updates
- **Connection Pooling**: Neon serverless handles connection management

## Changelog

Changelog:
- June 27, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.