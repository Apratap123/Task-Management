# Task Assignment Manager

## Overview of Implementation
The Task Assignment Manager is a full-stack web application designed to streamline the process of assigning, managing, and tracking student tasks. It allows administrators (e.g., teachers or instructors) to create assignments with OneDrive submission links and view analytics, while enabling students to form groups and submit assignments collaboratively. 

The application is built using a modern stack:
* **Frontend:** React (built with Vite), Tailwind CSS for styling, and React Router for navigation.
* **Backend:** Node.js with Express.js, handling RESTful API requests.
* **Database:** PostgreSQL, accessed and modeled using Prisma ORM.
* **Authentication:** Stateless JWT (JSON Web Token) based authentication with bcrypt for password hashing.

## Setup & Run Instructions

### Prerequisites
* Node.js (v16 or higher recommended)
* PostgreSQL running locally or hosted (e.g., Supabase, Neon)

### 1. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder and add the following variables:
```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
```

Initialize the database schema and start the server:
```bash
# Push the Prisma schema to your database
npx prisma db push

# Start the development server
npm run dev
# (or use `node server.js` / `nodemon server.js`)
```
The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The frontend will be accessible at `http://localhost:5173`.

---

## API Endpoint Details

### Authentication
* `POST /api/auth/register`
  * **Description:** Registers a new user.
  * **Body:** `{ "name": "...", "email": "...", "password": "...", "role": "STUDENT" | "ADMIN" }`
* `POST /api/auth/login`
  * **Description:** Authenticates a user and returns a JWT.
  * **Body:** `{ "email": "...", "password": "..." }`

### Assignments
* `GET /api/assignments`
  * **Description:** Fetches all assignments and their submissions.
  * **Headers:** `Authorization: Bearer <token>`
* `POST /api/assignments` (Admin Only)
  * **Description:** Creates a new assignment.
  * **Headers:** `Authorization: Bearer <token>`
  * **Body:** `{ "title": "...", "description": "...", "dueDate": "YYYY-MM-DD", "onedriveLink": "..." }`

### Groups & Students
* `GET /api/groups`
  * **Description:** Gets groups the current user is a member of.
  * **Headers:** `Authorization: Bearer <token>`
* `POST /api/groups`
  * **Description:** Creates a new group and associates selected members.
  * **Headers:** `Authorization: Bearer <token>`
  * **Body:** `{ "name": "...", "memberIds": ["uuid1", "uuid2"] }`
* `GET /api/students`
  * **Description:** Retrieves a list of all students (used for group creation).
  * **Headers:** `Authorization: Bearer <token>`

### Submissions & Analytics
* `POST /api/submissions`
  * **Description:** Marks an assignment as submitted by a specific group.
  * **Headers:** `Authorization: Bearer <token>`
  * **Body:** `{ "assignmentId": "...", "groupId": "..." }`
* `GET /api/analytics` (Admin Only)
  * **Description:** Fetches dashboard analytics (total assignments, groups, and recent submissions).
  * **Headers:** `Authorization: Bearer <token>`

---

## Database Schema & Relationships

```mermaid
erDiagram
    User {
        String id PK
        String name
        String email UK
        String passwordHash
        Role role
        DateTime createdAt
    }
    Group {
        String id PK
        String name
        DateTime createdAt
        String createdById FK
    }
    GroupMember {
        String id PK
        String groupId FK
        String userId FK
    }
    Assignment {
        String id PK
        String title
        String description
        DateTime dueDate
        String onedriveLink
        DateTime createdAt
        String createdById FK
    }
    Submission {
        String id PK
        String assignmentId FK
        String groupId FK
        SubmissionStatus status
        DateTime submittedAt
    }

    User ||--o{ Group : "creates"
    User ||--o{ GroupMember : "is member of"
    User ||--o{ Assignment : "creates"
    Group ||--o{ GroupMember : "has members"
    Group ||--o{ Submission : "submits"
    Assignment ||--o{ Submission : "receives"
```

---

## Architecture Overview

**1. Presentation Layer (Frontend - React/Vite)**
* Implements a Single Page Application (SPA) architecture.
* React Router manages protected and public routes based on authentication state.
* `AuthContext` provides global state management for the user's session and JWT.
* Axios intercepts requests to automatically attach the `Authorization` header.

**2. Application Layer (Backend - Express.js)**
* Acts as a REST API layer handling business logic and request validation.
* Middleware architecture handles CORS, JSON parsing, and role-based authentication (verifying JWTs).
* Separates student concerns (group formation, submission) from admin concerns (creating assignments, analytics).

**3. Data Access & Storage Layer (Prisma + PostgreSQL)**
* Prisma acts as a type-safe query builder and ORM.
* PostgreSQL provides robust relational data integrity ensuring unique constraints (e.g., a group can only submit an assignment once, handled by `@@unique([assignmentId, groupId])`).

**Data Flow Example (Submitting an Assignment):**
1. User clicks "Submit" on the React Frontend.
2. Axios sends a `POST` request to `/api/submissions` with the JWT in the header.
3. Express Middleware verifies the JWT.
4. Route handler validates if the user belongs to the specified group.
5. Prisma performs an `upsert` operation on the PostgreSQL database.
6. The backend responds with success, and the React UI updates the status.

---

## Key Design and Deployment Decisions

1. **Prisma ORM over Raw SQL/Mongoose:** Prisma was chosen for its excellent developer experience, auto-generated migrations, and strict type safety, which significantly reduces runtime database errors compared to traditional ORMs.
2. **Stateless JWT Authentication:** Instead of using stateful sessions (which require server memory or Redis), JWTs were used. This allows the backend to be easily scalable and stateless, simplifying potential future deployment via serverless functions or container orchestration.
3. **Tailwind CSS:** Used for styling to ensure a rapid development cycle without leaving JSX files. It keeps the bundle size small and provides a highly responsive, modern UI out of the box.
4. **Vite vs Create React App:** Vite was chosen for the frontend tooling because of its significantly faster Hot Module Replacement (HMR) and optimized build speeds utilizing esbuild.
5. **Deployment Considerations (Future-proofing):** 
    * The frontend is completely decoupled, meaning it can be statically hosted on platforms like Vercel, Netlify, or AWS S3. 
    * The backend can be deployed to Render, Heroku, or AWS EC2/ECS. 
    * The PostgreSQL database can be managed via Supabase or Neon to maintain a serverless ecosystem.
