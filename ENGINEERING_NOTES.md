# Engineering Notes
## 1. How would this service scale to handle 1 million tasks?
Multiple considerations could be taken for this service to scale to 1 million tasks effeciently. 

First, proper indexing is required (which is implemented, as you can see in the next section), to make read requests faster and more effecient.

Read replicas (i.e: read-only copies of the database) could be deployed to increase capacity and performance of read queries. By redirecting read requests to the replicas, the main database performs better to manage write requests.

Moreover, cursor-based pagination, using `_id` or `createdAt` indexed fields would be a good idea with such a large dataset, since offset pagination would cause a great performance penalty. 

Another idea would be to implement caching through Redis, removing a great load from the database. Using a strategy such as Cache-Aside would mean that database would only be accessed when there's a cache miss.

Finally, horizontal scaling, by adding new server instances, to the system to distribute the workload through a load balancer would increase availability for requests accompanied by a large number of tasks like this.

