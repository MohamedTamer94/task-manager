# Engineering Notes

## Table of Contents

- [1. How would this service scale to handle 1 million tasks?](#1-how-would-this-service-scale-to-handle-1-million-tasks)
- [2. What indexing strategy would you apply and why?](#2-what-indexing-strategy-would-you-apply-and-why)
- [3. How would you introduce authentication and authorization?](#3-how-would-you-introduce-authentication-and-authorization)
- [4. How would you deploy this in production?](#4-how-would-you-deploy-this-in-production)
- [5. How would you structure CI/CD for this project?](#5-how-would-you-structure-cicd-for-this-project)
- [6. What monitoring and logging tools would you introduce?](#6-what-monitoring-and-logging-tools-would-you-introduce)

## 1. How would this service scale to handle 1 million tasks?

Multiple considerations could be taken for this service to scale to 1 million tasks efficiently.

First, proper indexing is required (which is already implemented, as covered in the next section) to make read requests faster and more efficient.

Read replicas (read-only copies of the database) could be deployed to increase the capacity and performance of read queries. By redirecting read traffic to the replicas, the primary database is freed up to handle write requests more effectively.

Cursor-based pagination using `_id` or `createdAt` indexed fields would also be a good idea at this scale, since offset pagination introduces a significant performance penalty on large datasets.

Caching through Redis would remove a substantial load from the database. A Cache-Aside strategy would mean the database is only accessed on a cache miss, keeping the hot path fast.

Finally, horizontal scaling, by adding new server instances behind a load balancer, would distribute the workload and increase availability as the number of tasks grows.

## 2. What indexing strategy would you apply and why?

The indexing strategy follows the actual query patterns of the service rather than speculating upfront.

- `{ deletedAt: 1 }`: every query filters on tasks (to filter out soft deleted ones), so this is foundational.
- `{ status: 1, deletedAt: 1 }`: filtering by status is one of the most common operations.
- `{ priority: 1, deletedAt: 1 }`: same reasoning as status.
- `{ dueDate: 1, deletedAt: 1 }`: required for date range queries.
- Text index on `title` : to support search. For higher traffic or more complex search needs, this would be offloaded to a dedicated search engine like Elasticsearch.

Indexes are aligned with actual filter conditions to avoid unnecessary overhead. Over-indexing was intentionally avoided to keep write performance efficient.

## 3. How would you introduce authentication and authorization?

I would introduce JWT-based authentication with the following steps:

1. Add a `User` model.
2. Associate every task with a `userId` (or `organizationId` for future multi-tenant support).
3. Require a JWT in request headers for all protected routes.
4. Add middleware to validate the token and attach the user to the request object.
5. Update all queries to include `userId` filtering to enforce data ownership.
6. Implement login and signup pages with their respective backend endpoints.

For authorization, I would implement role-based access control (RBAC). For collaboration features, roles like owner, editor, and viewer should be applied, with access checks enforced to prevent leaks.

## 4. How would you deploy this in production?

I would containerize the app using Docker.

Deployment setup:
- I will put Node.JS API behind a reverse proxy (NGINX)
- MongoDB will be hosted on a manged service such as Atlas
- Environment variables will be managed securely
- HTTPS enforced.
- Health check endpoint (/health) integrated with the load balancer.

Frontend:

- Built with Vite and deployed on a CDN (e.g., Vercel or similar).

For reliability, I would configure auto-restart policies on container failure, centralized logging, and basic monitoring alerts to catch issues before users do.

## 5. How would you structure CI/CD for this project?

GitHub Actions would be sufficient for this pipeline.

**CI**: runs on every pull request:
1. Install dependencies
2. Lint
3. Run unit tests (if present)
4. Build frontend
5. Ensure backend compiles

**CD**: triggers on merge to main:
1. Build Docker image
2. Push to container registry
3. Deploy to staging
4. Run smoke tests
5. Promote to production

Production promotion would ideally require a manual approval step or be gated behind a tagged release to avoid accidental deployments.

## 6. What monitoring and logging tools would you introduce?

For logging, I would introduce structured logging using Pino or Winston, with request IDs attached to every log entry for traceability across services.

For monitoring, Prometheus + Grafana would cover infrastructure metrics like CPU, memory, and request throughput. An APM tool like Datadog or New Relic would handle performance tracing and slow query detection. Sentry would be added for both frontend and backend error tracking, giving stack traces with context rather than just raw logs.

On top of that, database performance metrics, response times, and error rates would all be tracked with alerting thresholds so issues surface before users report them.
