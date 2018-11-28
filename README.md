# timeflies-backend

TimeFlies Node.js backend.

As with my [coding journey](https://github.com/stoneLeaf/coding-journey), I will try to lay out my chain of thoughts and progress, adding insights to the commit history.

## Setup

> npm init

> npm install express

Choosing [Winston](https://github.com/winstonjs/winston) for general logging, with [some configuration](https://thisdavej.com/using-winston-a-versatile-logging-library-for-node-js/), and [Morgan](https://github.com/expressjs/morgan) for HTTP requests logging.

> npm install winston morgan

At that point I started to create the Node app entry point, *app.js* here, and needed to understand the [concept of middleware](https://expressjs.com/en/guide/using-middleware.html). I had to figure out what *app.use()* does, how path are handled, the use of the *next()* function and the order middlewares are executed.
