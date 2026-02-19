# Task Manager

Task manager is a CRUD full stack website that helps with managing one's tasks effectively. It's built to expand in the future to a multi-user collaboration platform.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions (Local)](#setup-instructions-local)
- [API Design](#api-design)
- [Architecture Decisions](#architecture-decisions)
- [Trade-offs](#trade-offs)
- [Engineering Notes](#engineering-notes)

## Tech Stack

#### Backend
- Node.js
- Express.js
- MongoDB + Mongoose for ODM
- Joi (for validation)

#### Frontend
- React (Vite)
- TanStack Query
- Axios
- Tailwind CSS

## Features

#### Backend
- Layered Architecture (controllers, services, models, routes)
- Validation (Joi + Mongoose)
- Filtering (status, priority, date range)
- Pagination (Page/Offset-Based)
- Soft deletion
- Partial Updates
- Centralized error handling
- Basic Logging

#### Frontend
- Task creation with validation using Form
- Inline Editing
- Advanced Filtering
- Debounced Search
- Pagination
- Loading, empty & error states

## Project Structure

#### Backend
````
backend/
  config/
    db.js (MongoDB connection)
    env.js (Read configuration from env variables)
  routes/ (app's endpoints)
  controllers/ (HTTP layer logic)
  services/ (Core business logic)
  models/ (MongoDB schemas)
  middlewares/
    error.middleware.js (Central error middleware)
    notfound.middleware.js (Handles 404 errors)
    validate.middleware.js (Validate user's query before processing)
  validators/ (Joi schemas for validation)
````

#### Frontend
````
frontend/
  api/
    http.js (Base Axios instance)
    tasks.api.js (Backend functions)
  components/ (Reusable components)
  pages/ (App's pages, currently it's a single one)
  utils/
````

## Setup Instructions (Local)

#### Backend

1- Clone Repository
````bash
git clone https://github.com/MohamedTamer94/task-manager
cd task-manager
````

2- Install dependencies
````bash
cd backend
npm install
````

3- Setup .env variables
````bash
cp .env.example .env
````

Then update the environment variables to match your setup
````
PORT=3001
DATABASE_URL=mongodb://localhost:27017/task_manager
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5173
````

4- Run app in development mode
````bash
npm run dev
````

#### Frontend

1- Install Dependencies
````bash
cd frontend
npm install
````

2- Setup environment variables
````bash
cp .env.example .env
````

Then update the environment variables to match your setup
````
VITE_API_BASE_URL=http://localhost:3001/api
````

3- Run vite app
````bash
npm run dev
````

## API Design

#### POST `/api/tasks`

Create new task.

Request Body:
````json
{
  "title": "Finish project",
  "description": "Complete API documentation",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-02-20"
}
````

Body Fields:
| Field       | Type   | Required | Default  | Notes                          |
| ----------- | ------ | -------- | -------- | ------------------------------ |
| title       | string | Yes      | —        | Min length: 3                  |
| description | string | No       | —        | Can be empty string            |
| status      | string | No       | `todo`   | `todo` \| `doing` \| `done`   |
| priority    | string | No       | `medium` | `low` \| `medium` \| `high`   |
| dueDate     | date   | No       | —        | Valid date                     |

Success Response:
````json
{
  "message": "Task created successfully",
  "success": true,
  "data": {
    "_id": "65f123abc456def789012345",
    "title": "Finish project",
    "description": "Complete API documentation",
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-02-20T00:00:00.000Z"
  }
}
````

Possible Errors:
- 400 – Validation error (missing title, invalid enum, etc.)
- 500 – Server error

#### GET `/api/tasks`

Retrieve paginated and filtered list of tasks.

Query Parameters:
| Param    | Type   | Required | Default | Description                        |
| -------- | ------ | -------- | ------- | ---------------------------------- |
| page     | number | No       | 1       | Page number (min: 1)               |
| limit    | number | No       | 20      | Items per page (min: 1, max: 100)  |
| q        | string | No       | —       | Search query                       |
| status   | string | No       | —       | `todo` \| `doing` \| `done`        |
| priority | string | No       | —       | `low` \| `medium` \| `high`        |
| from     | date   | No       | —       | Due date starting from             |
| to       | date   | No       | —       | Due date up to (must be >= from)   |

Example:
````
GET /api/tasks?page=1&limit=10&status=todo&priority=high
````

Success Response:
````json
{
  "data": [
    {
      "id": "65f123abc456def789012345",
      "title": "Finish project",
      "description": "Complete API documentation",
      "status": "todo",
      "priority": "high",
      "dueDate": "2026-02-20T00:00:00.000Z",
      "createdAt": "2026-02-18T12:00:00.000Z",
      "updatedAt": "2026-02-18T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
````

Possible Errors:
- 400 – Validation error (invalid query params)
- 500 – Server error

#### GET `/api/tasks/:id`

Retrieve a task by ID.

Path Parameter:
| Param | Type   | Required |
| ----- | ------ | -------- |
| id    | string | Yes      |

Example:
````
GET /api/tasks/65f123abc456def789012345
````

Success Response:
````json
{
  "data": {
    "_id": "65f123abc456def789012345",
    "title": "Finish project",
    "description": "Complete API documentation",
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-02-20T00:00:00.000Z"
  }
}
````

Possible Errors:
- 400 – Invalid ID format
- 404 – Task not found
- 500 – Server error

#### PATCH `/api/tasks/:id`

Update one or more task fields.

Path Parameter:
| Param | Type   | Required |
| ----- | ------ | -------- |
| id    | string | Yes      |

Request Body — at least one field is required:
````json
{
  "title": "Updated title",
  "status": "doing"
}
````

Allowed Fields:
- title (min 3 chars)
- description
- status: `todo` | `doing` | `done`
- priority: `low` | `medium` | `high`
- dueDate

Unknown fields are not allowed. Body must contain at least one field.

Success Response:
````json
{
  "success": true,
  "data": {
    "_id": "65f123abc456def789012345",
    "title": "Updated title",
    "status": "doing"
  }
}
````

Possible Errors:
- 400 – Validation error (invalid enum, empty body, bad ID format)
- 404 – Task not found
- 500 – Server error

#### DELETE `/api/tasks/:id`

Delete a task by ID.

Path Parameter:
| Param | Type   | Required |
| ----- | ------ | -------- |
| id    | string | Yes      |

Success Response:
````json
{
  "success": true
}
````

Possible Errors:
- 400 – Invalid ID format
- 404 – Task not found
- 500 – Server error

## Architecture Decisions

### Layered Architecture

API, business logic, database schemas, and routes are separated to enhance maintainability, scalability, and code organization. Every layer has its own isolated responsibilities (i.e. separation of concerns). Debugging and maintaining becomes easier as fixing a single issue or adding a new feature doesn't require restructuring the whole codebase. Scalability is also enhanced as each layer can scale independently; for example, allocating more resources to the database layer without impacting the services layer. Separation of concerns also allows reusability of common pieces of the codebase, eliminating redundancy.

This can be easily seen in both the backend and frontend modules. The backend was separated into:
- Routes (Endpoint Definition)
- Controllers (HTTP Layer)
- Services (Core business logic)
- Models (MongoDB ODM Schema definitions)

Likewise, the frontend was separated into:
- Pages: the main wrapper of all components, useful when expanding into a multi-page app
- Components: reusable widgets to be used all over the app
- API: calling backend functions and returning data separately from the UI

### Joi + Mongoose Validation

Validation is an essential layer in any backend application. Without it, the database is open to hijacking, unwanted data slips through, and the user experience breaks down.

A multi-layer validation approach was implemented in this app. First, at the request level, Joi ensures all data syntax is valid and handles sanitization and transformation. Second, Mongoose validation operates at the application level (just before saving to the database), acting as a safety net to ensure that data (even if it passed API-level checks) is appropriate for the database schema.

### Soft Deletion

Soft deletion marks data as deleted using a `deletedAt` timestamp rather than physically removing it from the database, allowing for easy data recovery, auditing, and maintaining historical relationships. It prevents accidental data loss, enables a user-friendly "undo" functionality (to be implemented in the future), and helps with compliance by retaining data for record-keeping purposes.

### Why skip/limit Pagination

Skip/limit (offset-based) pagination divides large database result sets into small, manageable chunks, improving API response times and enhancing user experience. It's a straightforward, easy-to-implement technique that works well for small to medium datasets. However, as data grows and performance degrades at large offsets, migrating to cursor-based pagination would be the natural next step.

### Why React Query on the Frontend

React Query (part of the TanStack Query library) manages server-side data with minimal boilerplate, automating complex tasks like fetching, caching, synchronization, and error handling. Its main advantage is replacing repetitive data-fetching logic such as manual loading/error states, `useEffect`, `try/catch` with simple, declarative hooks like `useQuery` and `useMutation`, making the code cleaner and easier to maintain. It also supports caching, optimistic updates, and scales well as the app grows.

## Trade-offs

### 1. Offset Pagination (skip/limit) vs Cursor-based Pagination

This implementation uses offset-based pagination (skip + limit) for simplicity and clarity. While sufficient for moderate dataset sizes, it can become less efficient at very large offsets (e.g., millions of records). In a production system expected to handle very large datasets, cursor-based pagination (using indexed fields such as `_id` or `createdAt`) would be preferable for better performance and consistency.

### 2. No Authentication Layer (Out of Scope)

Authentication and authorization were intentionally excluded for simplicity, allowing more focus on core logic and system design. In a production system, tasks would be associated with a user entity (likely through a `tasks.userId` field) and role-based access control would be implemented. Read more in the engineering discussion document. 

### 3. Query Invalidation Instead of Optimistic Updates

On the frontend, mutations invalidate queries rather than implementing optimistic updates. This ensures data consistency and reduces complexity. Optimistic updates could be added for enhanced UX in high-interaction environments.

### 4. Basic Logging Instead of a Structured Logging Pipeline

Logging is implemented at a basic level (HTTP request logging and error logging). For production environments, structured logging (e.g., with Pino or Winston), centralized log aggregation, and monitoring tools would be introduced.

## Engineering Notes

Further thoughts on production deployment, scalability, and maintainability are discussed in [`ENGINEERING_NOTES.md`](./ENGINEERING_NOTES.md).
