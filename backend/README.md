# Customer Feedback Board - Backend

## Overview

B2B SaaS platform for collecting and prioritizing customer feedback. Companies create public boards where users submit and vote on feature requests.

## Tech Stack

- **Backend**: NestJS, TypeScript, TypeORM
- **Database**: PostgreSQL (hosted on Supabase)
- **Authentication**: JWT (admin only)
- **Validation**: class-validator
- **Password Hashing**: bcrypt

## Architecture

```
backend/src/
├── entities/              # All database entities
│   ├── company.entity.ts
│   ├── feedback.entity.ts
│   ├── user.entity.ts
│   └── vote.entity.ts
├── modules/               # Feature modules
│   ├── auth/             # JWT authentication
│   ├── company/          # Company management
│   ├── feedback/         # Feedback CRUD
│   └── vote/             # Voting system
├── config/               # Configuration
│   └── typeorm.config.ts
└── scripts/              # Utility scripts
    └── seed.ts           # Database seeding
```

## Database Schema

```sql
-- Companies table
companies (
  id: UUID (PK)
  name: VARCHAR(255)
  slug: VARCHAR(255) UNIQUE
  created_at: TIMESTAMP
)

-- Users table (admins)
users (
  id: UUID (PK)
  email: VARCHAR(255) UNIQUE
  password_hash: VARCHAR(255)
  company_id: UUID (FK -> companies)
  created_at: TIMESTAMP
)

-- Feedback table
feedback (
  id: UUID (PK)
  company_id: UUID (FK -> companies)
  title: VARCHAR(255)
  description: TEXT
  category: ENUM('feature', 'bug', 'improvement', 'other')
  status: ENUM('new', 'under_review', 'planned', 'in_progress', 'completed')
  submitter_email: VARCHAR(255) NULLABLE
  vote_count: INTEGER DEFAULT 0
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)

-- Votes table
votes (
  id: UUID (PK)
  feedback_id: UUID (FK -> feedback)
  voter_identifier: VARCHAR(255)
  created_at: TIMESTAMP
  UNIQUE(feedback_id, voter_identifier)
)
```

## API Endpoints

Base URL: `http://localhost:3001/api`

### Authentication Endpoints

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@techcorp.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Register (Admin)

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "newadmin@company.com",
  "password": "securepassword",
  "companyId": "uuid-of-company"
}

Response:
{
  "id": "uuid",
  "email": "newadmin@company.com",
  "companyId": "uuid-of-company",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Company Endpoints

#### List Companies

```
GET /api/companies
GET /api/companies?name=Tech

Response:
[
  {
    "id": "uuid",
    "name": "TechCorp Solutions",
    "slug": "techcorp",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Get Company by Slug

```
GET /api/companies/techcorp

Response:
{
  "id": "uuid",
  "name": "TechCorp Solutions",
  "slug": "techcorp",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Feedback Endpoints

#### List Feedback

```
GET /api/feedback
GET /api/feedback?companyId=uuid
GET /api/feedback?status=planned
GET /api/feedback?category=feature
GET /api/feedback?search=dark+mode

Response:
[
  {
    "id": "uuid",
    "companyId": "uuid",
    "title": "Add dark mode support",
    "description": "It would be great to have a dark mode...",
    "category": "feature",
    "status": "planned",
    "submitterEmail": "user@example.com",
    "voteCount": 45,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Get Single Feedback

```
GET /api/feedback/{id}

Response: Single feedback object
```

#### Submit Feedback (Public)

```
POST /api/feedback
Content-Type: application/json

{
  "companyId": "uuid",
  "title": "Add export functionality",
  "description": "Need to export data as CSV",
  "category": "feature",
  "submitterEmail": "user@example.com" // optional
}

Response: Created feedback object
```

#### Update Feedback Status (Admin Only)

```
PATCH /api/feedback/{id}
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "status": "in_progress"
}

Response: Updated feedback object
```

#### Delete Feedback (Admin Only)

```
DELETE /api/feedback/{id}
Authorization: Bearer {jwt_token}

Response: 200 OK
```

### Vote Endpoints

#### Cast Vote (Public)

```
POST /api/votes
Content-Type: application/json

{
  "feedbackId": "uuid"
}

Response:
{
  "id": "uuid",
  "feedbackId": "uuid",
  "voterIdentifier": "hashed-value",
  "createdAt": "2024-01-01T00:00:00Z"
}

Note: Voter is identified by IP + User-Agent hash
```

#### Remove Vote (Public)

```
DELETE /api/votes/{feedbackId}

Response: 200 OK

Note: Only removes if same voter identifier
```

#### Check User Votes

```
GET /api/votes/user-votes?feedbackIds=id1,id2,id3

Response:
[
  {
    "id": "uuid",
    "feedbackId": "id1",
    "voterIdentifier": "hashed-value",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=3001

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Running the Backend

```bash
# Install dependencies
cd backend
pnpm install

# Run database migrations
pnpm typeorm migration:run

# Seed test data
pnpm seed

# Development mode
pnpm start:dev

# Production build
pnpm build
pnpm start:prod
```

## Test Data

The seed script creates:

- 3 companies: TechCorp Solutions, StartupHub, DevTools Inc
- Admin users for each company (password: `password123`)
- 4-6 sample feedback items per company

Test accounts:

- `admin@techcorp.com` / `password123`
- `admin@startuphub.com` / `password123`
- `admin@devtools.com` / `password123`
