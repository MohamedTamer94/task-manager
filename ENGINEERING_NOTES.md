# Engineering Notes
## 1. How would this service scale to handle 1 million tasks?
Multiple considerations could be taken for this service to scale to 1 million tasks effeciently. 

First, proper indexing is required (which is implemented, as you can see in the next section), to make read requests faster and more effecient.

Read replicas (i.e: read-only copies of the database) could be deployed to increase capacity and performance of read queries. By redirecting read requests to the replicas, the main database performs better to manage write requests.

Moreover, cursor-based pagination, using `_id` or `createdAt` indexed fields would be a good idea with such a large dataset, since offset pagination would cause a great performance penalty. 

Another idea would be to implement caching through Redis, removing a great load from the database. Using a strategy such as Cache-Aside would mean that database would only be accessed when there's a cache miss.

Finally, horizontal scaling, by adding new server instances, to the system to distribute the workload through a load balancer would increase availability for requests accompanied by a large number of tasks like this.

## 2. What indexing strategy would you apply and why?
Indexing strategy depends on query patterns.

For this service:

- { deletedAt: 1 }

Because every query filters on non-deleted tasks.

- `{ status: 1, deletedAt: 1 }`

Since filtering by status is common.

- `{ priority: 1, deletedAt: 1 }`

Same reasoning as status.

- `{ dueDate: 1, deletedAt: 1 }`

For date range queries.

Text index on title (or carefully optimized search strategy)
To support search capability.

Indexes are aligned with actual filter conditions to avoid unnecessary overhead. I avoided over-indexing to keep write performance efficient.

## 3. How would you introduce authentication and authorization?

I would introduce JWT-based authentication

#### Steps:
1- First, I will add `User` model

2- I will associate every task with `userId` (or maybe `organizationId` for multi-tenant support)

3- Require JWT in request headers

4- Use middleware to validate token and attach user to request.

5- Update all queries to include userId filtering to enforce ownership.

6- Implement log-in and sign-up pages with their respective backend endpoints

For authorization:

- Implement role-based access control (RBAC).

- For collaboration features, define roles such as owner, editor, viewer.

- Enforce access checks at the service layer.

## 4. How would you deploy this in production?

I would containerize this using Docker.

Deployment setup:
- I will put Node.JS API behind a reverse proxy (NGINX)
- MongoDB will be hosted on a manged service such as Atlas
- Environment variables will be managed securely
- HTTPS enforced.
- Health check endpoint (/health) integrated with the load balancer.

Frontend:

- Built with Vite and deployed on a CDN (e.g., Vercel or similar).

For reliability:

- Use auto-restart policies.

- Implement centralized logging.

- Enable basic monitoring alerts.

## 5. How would you structure CI/CD for this project?

CI:
Steps:

- Install dependencies

- Lint

- Run unit tests (if present)

- Build frontend

- Ensure backend compiles

CD:

- On merge to main:

    - Build Docker image

    - Push to container registry

    - Deploy to staging

    - Run smoke tests

    - Promote to production

GitHub Actions would be sufficient for this pipeline.

## 6. What monitoring and logging tools would you introduce?
For logging:

- Structured logging using Pino or Winston.

- Include request IDs for traceability.

For monitoring:

- Prometheus + Grafana for metrics.

- APM tool (e.g., Datadog, New Relic) for performance tracing.

- Sentry for frontend and backend error tracking.

Additionally:

- Monitor database performance metrics.

- Track response times and error rates.