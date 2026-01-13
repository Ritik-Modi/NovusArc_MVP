# Server Architecture Report

This is a detailed report on the server architecture for the NovusArc-MVP project. The server is built using Node.js, Express.js, and TypeScript, and appears to be a job placement platform with features for students, companies, jobs, applications, interviews, notifications, analytics, and data imports.

## Overall Structure

- **Base URL**: All routes are prefixed under `/api` (assuming from app.ts, but not shown).
- **Authentication**: Uses JWT tokens for auth, with signup, login, logout, and refresh endpoints.
- **Roles**: Likely includes students, companies, admins, etc., with RBAC middleware.
- **Database**: Uses MongoDB (based on Mongoose models).
- **Workers**: Background jobs for aggregation, email, export, import.

## Controllers and Routes

Below is a breakdown of each controller, its purpose, and the associated routes.

### 1. Auth Controller (`auth.controller.ts`)
**Purpose**: Handles user authentication, including signup, login, token management.

**Routes** (under `/auth`):
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - Logout (invalidate token)
- `POST /auth/refresh` - Refresh access token

### 2. Users Controller (`users.controller.ts`)
**Purpose**: Manages user accounts, profiles, and basic CRUD operations.

**Routes** (under `/users`):
- `GET /users` - List all users (admin)
- `GET /users/me` - Get current user's profile
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user (soft delete?)

### 3. Students Controller (`students.controller.ts`)
**Purpose**: Handles student profiles, including listing, updating, and resume uploads.

**Routes** (under `/students`):
- `GET /students` - List students
- `GET /students/:id` - Get student profile
- `PUT /students/:id` - Update student profile
- `POST /students/:id/resume` - Upload student resume

### 4. Companies Controller (`companies.controller.ts`)
**Purpose**: Manages company profiles, including CRUD operations and slug generation for URLs.

**Routes** (under `/companies`):
- `GET /companies` - List companies (with search, pagination)
- `GET /companies/:id` - Get company by ID or slug
- `POST /companies` - Create new company
- `PUT /companies/:id` - Update company
- `DELETE /companies/:id` - Delete company (soft delete, sets isActive to false)

### 5. Jobs Controller (`jobs.controller.ts`)
**Purpose**: Handles job postings, including creation, listing, updating, and closing jobs.

**Routes** (under `/jobs`):
- `GET /jobs` - List jobs (public)
- `GET /jobs/:id` - Get job details
- `POST /jobs` - Create new job posting
- `PUT /jobs/:id` - Update job
- `POST /jobs/:id/close` - Close job posting

### 6. Applications Controller (`applications.controller.ts`)
**Purpose**: Manages job applications, including applying, listing, status updates, and withdrawals.

**Routes** (under `/applications`):
- `POST /applications/:jobId/apply` - Student applies to a job
- `GET /applications/job/:jobId` - List applications for a job (company view)
- `GET /applications/student` - List current student's applications
- `PATCH /applications/:id/status` - Update application status (shortlist/reject/hire)
- `POST /applications/:id/withdraw` - Student withdraws application

### 7. Interviews Controller (`interviews.controller.ts`)
**Purpose**: Handles interview scheduling, management, and updates.

**Routes** (under `/interviews`):
- `POST /interviews` - Schedule an interview
- `GET /interviews/:id` - Get interview details
- `GET /interviews` - List interviews (with filters)
- `PATCH /interviews/:id` - Update interview (reschedule/cancel/complete)

### 8. Notifications Controller (`notifications.controller.ts`)
**Purpose**: Manages user notifications, including creation, listing, marking as read, and deletion.

**Routes** (under `/notifications`):
- `GET /notifications` - List current user's notifications
- `POST /notifications` - Create notification (system/admin)
- `POST /notifications/:id/read` - Mark notification as read
- `DELETE /notifications/:id` - Delete notification

### 9. Analytics Controller (`analytics.controller.ts`)
**Purpose**: Provides analytics and metrics for the platform, including dashboard summaries and company-specific data.

**Routes** (under `/analytics`):
- `GET /analytics/summary` - Dashboard summary KPIs
- `GET /analytics/placements` - Placements over time (with query params)
- `GET /analytics/company/:id` - Metrics for a specific company

### 10. Imports Controller (`imports.controller.ts`)
**Purpose**: Handles bulk data imports, likely for students, companies, or jobs via CSV/Excel files.

**Routes** (under `/imports`):
- `POST /imports` - Create an import job (file upload)
- `GET /imports/:id` - Get import job status
- `GET /imports` - List import jobs
- `POST /imports/:id/retry` - Retry a failed import

## Additional Components

- **Middleware**: Includes auth, rate limiting, RBAC, tenant isolation, validation.
- **Services**: Analytics, auth, CSV handling, eligibility checks, file uploads, email sending.
- **Workers**: Background jobs for aggregation, emails, exports, imports.
- **Models**: Mongoose models for all entities (User, Company, Job, Application, etc.).
- **Utils**: Logger, templates, validators (including slugify).

This server supports a full job placement workflow from user registration to placement analytics. If you need more details on specific controllers or models, let me know!