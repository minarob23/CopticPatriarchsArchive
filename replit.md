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
- June 27, 2025. Added dedicated login page for admin access
- June 27, 2025. Implemented data export (CSV) and comprehensive reporting functionality
- June 27, 2025. Fixed SelectItem empty value issues and improved navigation flow
- June 27, 2025. Successfully migrated from Replit Agent to Replit environment
- June 27, 2025. Fixed session security configuration and authentication loops
- June 27, 2025. Database tables created and application ready for production use
- June 27, 2025. Enhanced admin interface with beautiful statistics dashboard
- June 27, 2025. Redesigned homepage with advanced search engine and multiple view modes
- June 27, 2025. Added demo login credentials and sample patriarch data
- June 27, 2025. Moved advanced search engine from authenticated homepage to main landing page - now accessible to all users without login
- June 27, 2025. Added patriarch details modal and updated year references to 2025
- June 30, 2025. Successfully completed migration from Replit Agent to Replit environment with PostgreSQL database setup
- June 30, 2025. Populated database with 80 patriarch records covering all historical eras from apostolic to modern times
- June 30, 2025. Updated admin interface to display Arabic content for contributions, biography, and heresies fought
- June 30, 2025. Enhanced patriarch management table with comprehensive display of historical eras and heresies
- June 30, 2025. Confirmed Replit Auth integration working properly for admin access control
- July 1, 2025. Added Arabic translation system for heresies fought - all heresy names now display in Arabic throughout the application
- July 1, 2025. Enhanced patriarch management interface with proper Arabic display for biographical content and search functionality

## User Preferences

Preferred communication style: Simple, everyday language.