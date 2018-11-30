# timeflies-backend

TimeFlies Node.js backend.

As with my [coding journey](https://github.com/stoneLeaf/coding-journey), I will try to lay out my chain of thoughts and progress, adding insights to the commit history.

## Setup

> npm init

> npm install express

Choosing [Winston](https://github.com/winstonjs/winston) for general logging, with [some configuration](https://thisdavej.com/using-winston-a-versatile-logging-library-for-node-js/), and [Morgan](https://github.com/expressjs/morgan) for HTTP requests logging.

> npm install winston morgan

At that point I started to create the Node app entry point, *app.js* here, and needed to understand the [concept of middleware](https://expressjs.com/en/guide/using-middleware.html). I had to figure out what *app.use()* does, how paths are handled, the use of the *[next()](https://stackoverflow.com/a/13133140/8853013)* function and how middlewares are stacked. It was also very important that I learned [how CommonJS modules work](https://blog.risingstack.com/node-js-at-scale-module-system-commonjs-require/), understanding the *module.exports* and *require* duo. On a side note, it might be an obvious resource but I found the [Express API reference](https://expressjs.com/en/api.html) very helpful and well done.

Concerning routing, I decided to use Express router modules in chains to get a clean structure for the API routes. Express being very unopinionated, I spent a lot of time looking for best practices in articles and existing code. While it gave me some direction, it became *very* clear that, contrary to my *modest* Rails background, I had to make my own choices regarding almost every aspect of my architecture.

Although I intended to use an ORM, I thought that I had to try MongoDB first. Being the most common solution amongst Node stacks, it seemed important to have some working knowledge of it.

> npm install [mongoose](https://github.com/Automattic/mongoose)

I must say I'm unexpectedly impressed by mongoose's API. Schemas come with quite a few [helpers for validation](https://mongoosejs.com/docs/schematypes.html#schematype-options) and you can simulate joins with the [*populate()*](https://mongoosejs.com/docs/populate.html) method. Anyway, the first step is reading the [docs](https://mongoosejs.com/docs/), which are quite comprehensive and a must read for a newcomer like myself.

Same thing about schema design and (pseudo) relationships, I stumbled upon [3 parts article](https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design-part-1) which helped me a great deal. For this app, I have 3 models: User, Project, and Record. User has many projects and records. Project belongs to one user and has many records. Record belongs to one user and one project. I'm going with basic one-way referencing schemas to practice. In the meantime, I feel like I should have chosen a better case for this MongoDB *initiation* even so I knew from the start a relational database was more adequate for this app. But at least it gives me a concrete example of what it is not suited for.

From what I gathered so far, NoSQL databases like MongoDB are suited for (big) collections of, potentially non-normalized, data. Their benefits are high horizontal scalability, as you can easily split collections amongst servers, and very fast reads. For instance, in an online store, let's say we have of collection of products for a specific category. In each product entry you would embed its seller core data such as its name and id. Then when listing those products, you wouldn't have to join the seller table to get each product's seller name, it's already embedded in each product. The downside is that if the seller changes its name then you have to update every of his products' embedded data. In the balance it doesn't really matter because there are *far* more instances of people listing products than seller changing their names. In the end you get extra performance and almost endless potential scalability.

Anyway, I updated my schemas with references, created controllers to handle the routed requests and started to work with my models. To test and debug my API, I use [Postman](https://www.getpostman.com/). In the meantime, I'm learning a lot about modern JavaScript [promises](https://developers.google.com/web/fundamentals/primers/promises) which are fundamental due to the asynchronous nature of Node.
