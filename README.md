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

> npm install mongoose
