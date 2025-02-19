# Royal Apps Book Management System

A comprehensive book management application built with Remix, featuring author management, book CRUD operations, user profile management, and activity logging. This application follows clean architecture principles and can be deployed using Docker or run locally.

![Royal Apps Books](web/public/logo.png)

## Project Overview

This application was developed as part of the Royal Apps technical assessment. It implements a multi-layer architecture following clean code principles, with a focus on maintainability, testability, and separation of concerns.

The system allows users to manage authors and their books through a modern, responsive interface built with Shopify Polaris components. Key features include user authentication, comprehensive CRUD operations, profile management, and activity logging.

## Table of Contents
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Running with Docker](#running-with-docker)
  - [Running Locally](#running-locally)
- [Application Flow](#application-flow)
- [API Integration](#api-integration)

## Architecture

This project implements Clean Architecture principles to ensure separation of concerns, testability, and maintainability. The codebase is organized into the following layers:

1. **Presentation Layer** (UI components and routes)
   - `app/routes/` - Remix routes that handle UI rendering and user interactions
   - `app/components/` - Reusable UI components
   - `app/root.tsx` - Application shell and global providers

2. **Application Layer** (Use cases and business logic)
   - `app/services/` - Service modules that implement business rules
     - `auth.service.ts` - Authentication operations
     - `author.service.ts` - Author management
     - `book.service.ts` - Book operations
     - `user.service.ts` - User profile management
     - `activityLog.service.ts` - Activity tracking

3. **Domain Layer** (Core business entities and interfaces)
   - `app/types/` - TypeScript interfaces and types
     - `auth.ts` - Authentication entities
     - `author.ts` - Author domain models
     - `book.ts` - Book domain models
     - `user.ts` - User domain models

4. **Infrastructure Layer** (External services and technical concerns)
   - `app/utils/` - Technical implementations
     - `api-server.ts` - API client for server-side requests
     - `api-client.ts` - API client for client-side requests
     - `session.server.ts` - Session management
     - `auth.server.ts` - Authentication middleware
     - `date-formatter.ts` - Date formatting utilities

### Key Architecture Benefits
- **Separation of Concerns**: Each layer has specific responsibilities with clear boundaries
- **Dependency Rule**: Dependencies point inward, with domain at the center
- **Testability**: Business logic can be tested independently of UI and infrastructure
- **Maintainability**: Changes in one layer have minimal impact on others
- **Scalability**: New features can be added with minimal changes to existing code
- **Framework Independence**: Core business logic is isolated from framework details

## Features

- **Authentication**
  - Secure login with JWT token management
  - Session handling with server-side session storage

- **Author Management**
  - List all authors with pagination and filtering
  - Author details with associated books
  - Delete authors (if they have no books)

- **Book Management**
  - List all books with advanced filtering and pagination
  - Add new books with author selection
  - Edit existing books
  - Delete books

- **User Profile**
  - View and edit personal information
  - Activity logging for user actions
  - Secure logout functionality

## Tech Stack

- **Framework**: Remix.js with TypeScript
- **UI Components**: Shopify Polaris design system
- **Styling**: TailwindCSS with PostCSS
- **Containerization**: Docker with multi-environment support
- **State Management**: Remix built-in loaders/actions
- **API Integration**: Custom API client with fetch
- **Authentication**: Server-side sessions with cookies
- **Activity Tracking**: Client-side localStorage
- **Bundler**: Vite for optimized builds
- **Static Typing**: TypeScript for type safety

## Directory Structure

The application follows a clean architecture pattern with the following directory structure:

```
./
├── docker-compose.dev.yml     # Docker compose for development
├── docker-compose.yml         # Docker compose for production
├── package-lock.json          # Root package lock
└── web/                       # Main application directory
    ├── app/                   # Application code (Remix app)
    │   ├── components/        # Reusable UI components
    │   │   ├── BookList.tsx   # Book listing component
    │   │   └── DashboardLayout.tsx  # Main layout for dashboard
    │   ├── entry.client.tsx   # Remix client entry
    │   ├── entry.server.tsx   # Remix server entry
    │   ├── root.tsx           # Root component
    │   ├── routes/            # Application routes
    │   │   ├── _index.tsx     # Home/landing page
    │   │   ├── dashboard.authors.$id.tsx   # Author detail page
    │   │   ├── dashboard.authors._index.tsx # Authors listing
    │   │   ├── dashboard.books.$id.edit.tsx # Edit book page
    │   │   ├── dashboard.books._index.tsx   # Books listing
    │   │   ├── dashboard.books.new.tsx      # New book creation
    │   │   ├── dashboard.home.tsx           # Dashboard home
    │   │   ├── dashboard.profile._index.tsx # User profile
    │   │   ├── dashboard.profile.edit.tsx   # Edit profile
    │   │   ├── dashboard.tsx                # Dashboard layout route
    │   │   └── logout.tsx                   # Logout handler
    │   ├── services/          # Business logic & API integration (Application layer)
    │   │   ├── activityLog.service.ts # Activity logging service
    │   │   ├── auth.service.ts        # Authentication logic
    │   │   ├── author.service.ts      # Author operations
    │   │   ├── book.service.ts        # Book operations
    │   │   └── user.service.ts        # User profile operations
    │   ├── tailwind.css               # Tailwind styles
    │   ├── types/                     # Domain entities and interfaces (Domain layer)
    │   │   ├── auth.ts                # Auth-related types
    │   │   ├── author.ts              # Author entities
    │   │   ├── book.ts                # Book entities
    │   │   └── user.ts                # User profile types
    │   └── utils/                     # Infrastructure layer
    │       ├── api-client.ts          # Client-side API utilities
    │       ├── api-server.ts          # Server-side API client
    │       ├── auth.server.ts         # Server-side auth helpers
    │       ├── date-formatter.ts      # Date formatting utilities
    │       └── session.server.ts      # Session management
    ├── Dockerfile                     # Production Docker configuration
    ├── Dockerfile.dev                 # Development Docker configuration
    ├── package.json                   # Dependencies and scripts
    ├── postcss.config.js              # PostCSS configuration
    ├── public/                        # Static assets
    │   ├── favicon.ico                # Site favicon
    │   ├── logo-dark.png              # Dark theme logo
    │   ├── logo-light.png             # Light theme logo
    │   └── logo.png                   # Default logo
    ├── tailwind.config.ts             # Tailwind configuration
    ├── tsconfig.json                  # TypeScript configuration
    └── vite.config.ts                 # Vite bundler configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ or Docker
- npm or yarn

### Environment Setup

Create a `.env` file in the `web` directory with the following content:

```
API_URL=https://candidate-testing.api.royal-apps.io
SESSION_SECRET=your-secret-key
```

The API_URL is essential as it points to the Royal Apps Candidate Testing API.

### Running with Docker

The application is containerized with Docker for both development and production environments.

#### Development Environment

```bash
docker-compose -f docker-compose.dev.yml up --build
```

This starts the application in development mode with:
- Hot module replacement for instant updates
- Volume mounting for live code changes 
- Development-specific optimizations
- Access via http://localhost:3000

#### Production Environment

```bash
docker-compose up --build
```

This builds and starts the application in production mode with:
- Optimized bundle sizes
- Minified assets
- Production-ready server configuration
- Access via http://localhost:3000

### Running Locally

#### Development Mode

```bash
cd web
npm install
npm run dev
```
This starts the application in development mode with hot module replacement at http://localhost:3000.

#### Production Mode

```bash
cd web
npm install
npm run build
npm start
```
This builds the application for production and starts the server at http://localhost:3000.

## Application Flow

1. **Authentication**
   - Users log in via the login page using their credentials
   - The application authenticates against the Royal Apps API
   - Upon successful authentication, a JWT token is obtained
   - The token is securely stored in server-side session cookies
   - All subsequent API requests include this token for authorization

2. **Dashboard Layout**
   - After login, users are redirected to the dashboard
   - The `DashboardLayout` component provides consistent UI:
     - Top navigation with user info and logout button
     - Sidebar with links to authors, books, and profile
     - Main content area for displaying routes
   - Protected routes ensure authentication is required

3. **Author Management**
   - Author listing with pagination, filtering, and sorting
   - Author detail view showing all books by that author
   - Delete functionality (when an author has no books)
   - Fully responsive table layouts with Polaris components

4. **Book Management**
   - Book listing with advanced filtering and pagination
   - Add new books with author selection via dropdown
   - Edit existing book details (title, description, ISBN, etc.)
   - Delete books individually
   - Form validation and error handling

5. **Profile Management**
   - View personal information in profile dashboard
   - Edit profile details with validation
   - Real-time activity logging tracking user actions
   - Secure logout functionality

6. **Activity Logging**
   - Activity logging records user actions in the browser's localStorage
   - Tracks actions like:
     - Book/author creation, updates, and deletion
     - Profile updates
     - Page navigation
     - Login/logout events
   - Activities display in chronological order on the profile page

## API Integration

The application communicates with the Royal Apps Candidate Testing API:
- **Base URL**: https://candidate-testing.api.royal-apps.io  
- **Authentication**: Bearer token JWT authentication
- **API Client Architecture**:
  - `utils/api-server.ts` - Server-side API client for secure operations
  - `utils/api-client.ts` - Client-side API utilities
  - Strong typing with request/response interfaces
  - Error handling with appropriate status codes
  - Automatic token inclusion in requests

- **Service Layer**:
  - Each domain has a dedicated service:
    - `auth.service.ts` - Login, token management
    - `author.service.ts` - Author CRUD operations
    - `book.service.ts` - Book CRUD operations
    - `user.service.ts` - User profile operations
  - Services abstract API details from components
  - Consistent error handling patterns
  - Type-safe request/response handling

## Security Considerations

- **Token Security**:
  - JWTs are stored in server-side sessions, never in browser storage
  - Cookies are HTTP-only to prevent JavaScript access
  - Session data is encrypted with a secret key

- **Authentication Flow**:
  - Authentication is enforced for all protected routes via middleware
  - Automatic redirection to login for unauthenticated requests
  - Session expiration handling

- **API Security**:
  - All API requests include proper authorization headers
  - HTTPS is enforced for all communication
  - API errors are properly handled without leaking sensitive information

- **Data Validation**:
  - Form data is validated both client-side and server-side
  - Input sanitization to prevent injection attacks
  - Type checking with TypeScript

## Key Implementation Details

- **Remix Route Structure**:
  - Nested routing with resource-based organization
  - Loader/action pattern for data fetching and mutations
  - Error boundary handling

- **State Management**:
  - Server-side state via Remix loaders
  - Form state with controlled components
  - Activity state in localStorage

- **UI Implementation**:
  - Responsive design with Polaris components
  - Consistent styling with TailwindCSS utility classes
  - Loading states and error handling
  - Optimistic UI updates

- **Development Environment**:
  - TypeScript for type safety
  - Vite for fast builds
  - Hot module replacement
  - Docker for consistent environments
  - Environment variable management
