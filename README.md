# timeflies-backend

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
 [![Build Status](https://travis-ci.com/stoneLeaf/timeflies-backend.svg?branch=master)](https://travis-ci.com/stoneLeaf/timeflies-backend)

Timeflies is a time-tracking [SaaS](https://en.wikipedia.org/wiki/Software_as_a_service) built upon a full JavaScript stack. This repository contains a Node.js back-end meant to expose an API to clients such as [the Angular front-end](https://github.com/stoneLeaf/timeflies-angular).

## Table of contents

- [Setup](#setup)
- [Endpoints](#endpoints)
- [Development journal](#development-journal)
- [License](#license)

## Setup

In order to run this back-end API, the requirements are [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/get-npm) and a [MongoDB](https://www.mongodb.com/) instance (either local or cloud-based). You can then follow these steps :

- clone this repository
- `npm install` to install the dependencies
- edit the config files in the `config` directory, there's one for each environment (`development`, `test` and `production`)
- `npm start` to get the local server running

## Endpoints

Base path: `/api/v1`

| Method  | Endpoint      | Description                         |
| ------- | ------------- | ----------------------------------- |
| POST    | `/users`      | Register an account                 |
| GET     | `/profile`    | Get logged in user profile          |
| PATCH   | `/profile`    | Update current user profile         |
| POST    | `/auth/login` | Get token for bearer authentication |

| Method | Endpoint        | Description                |
| ------ | --------------- | -------------------------- |
| POST   | `/projects`     | Create a project           |
| GET    | `/projects`     | List current user projects |
| GET    | `/projects/:id` | Get project by id          |
| PATCH  | `/projects/:id` | Update project by id       |
| DELETE | `/projects/:id` | Delete project by id       |

| Method | Endpoint                   | Description                             |
| ------ | -------------------------- | --------------------------------------- |
| POST   | `/projects/:id/activities` | Create an activity in project           |
| GET    | `/projects/:id/activities` | List current user activities in project |
| GET    | `/activities`              | List current user activities            |
| GET    | `/activities/:id`          | Get activity with id                    |
| PATCH  | `/activities/:id`          | Update activity with id                 |
| DELETE | `/activities/:id`          | Delete activity with id                 |

| Method | Endpoint              | Description                |
| ------ | --------------------- | -------------------------- |
| GET    | `/stats/projects`     | Get global project stats   |
| GET    | `/stats/projects/:id` | Get specific project stats |

## Development journal

As with my [coding journey](https://github.com/stoneLeaf/coding-journey), I layed out my chain of thoughts and progress, adding insights to the commit history. It helped me to keep track of my advancement and step back when needed to get an overall perspective.

1. [Framework](#framework)
2. [Models](#models)
3. [Authentication](#authentication)
4. [Testing](#testing)
5. [The search for an API specification](#the-search-for-an-api-specification)
6. [Embracing TDD](#embracing-tdd)
7. [*Fiat lux*](#fiat-lux)
8. [DRYing tests](#drying-tests)
9. [Green is my new black](#green-is-my-new-black)
10. [Keeping focus](#keeping-focus)
11. [Hard work](#hard-work)
12. [It's a wrap](#its-a-wrap)
13. [What's next](#whats-next)

### Framework

> npm init

> npm install express

I chose [Winston](https://github.com/winstonjs/winston) for general logging, with [some configuration](https://thisdavej.com/using-winston-a-versatile-logging-library-for-node-js/), and [Morgan](https://github.com/expressjs/morgan) for HTTP requests logging.

> npm install winston morgan

At that point I started to create the Node.js application entry point, *app.js* in this case, and needed to understand the [concept of middleware](https://expressjs.com/en/guide/using-middleware.html). I had to figure out what *app.use()* does, how paths are handled, what's the role of the [next()](https://stackoverflow.com/a/13133140/8853013) function and how middlewares are stacked. It was also very important that I learned [how CommonJS modules work](https://blog.risingstack.com/node-js-at-scale-module-system-commonjs-require/), understanding the *module.exports* and *require* duo. On a side note, it might be an obvious resource but I found the [Express API reference](https://expressjs.com/en/api.html) very helpful and well done.

Concerning routing, I decided to use Express router modules in chains to get a clean structure for the API routes. Express being very unopinionated, I spent a lot of time looking for best practices in articles and existing code. While it gave me some direction, it became *very* clear that, contrary to my short [Rails](https://rubyonrails.org/) experience, I had to make my own choices regarding almost every aspect of the architecture.

### Models

Although I intended to use an [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping), I thought that I had to give a try to [MongoDB](https://www.mongodb.com/) first. Being the most common solution amongst Node.js stacks, it seemed important to have some working knowledge of it.

> npm install mongoose

I must say I was unexpectedly impressed by [mongoose](https://github.com/Automattic/mongoose)'s API. Schemas come with quite a few [helpers for validation](https://mongoosejs.com/docs/schematypes.html#schematype-options) and you can simulate joins with the [*populate()*](https://mongoosejs.com/docs/populate.html) method. Anyway, the first step was reading the [docs](https://mongoosejs.com/docs/), which are quite comprehensive and were a must read for a good introduction.

Same thing about schema design and *pseudo* relationships, I stumbled upon a [3 parts article](https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design-part-1) which helped me a great deal. At that point, I had 3 models: User, Project, and Activity. A user has many projects and activities. A project belongs to one user and has many activities. An activity belongs to one user and one project. I went with basic one-way referencing schemas for practice. In the meantime, I felt like I should have chosen a better case for this MongoDB *initiation*, even so I knew from the start a relational database was more adequate for this application. But at least it gave me a concrete example of what it was not suited for.

From what I had gathered so far, [NoSQL](https://en.wikipedia.org/wiki/NoSQL) databases like MongoDB are suited for (big) collections of, potentially non-normalized, data. Their benefits are high horizontal scalability, as you can easily split collections amongst servers, and very fast reads. For instance, in an online store, let's say we have of collection of products for a specific category. In each product entry you would embed its seller core data such as its name and id. Then when listing those products, you wouldn't have to join the seller table to get each product's seller name, since it's already embedded in each product. The downside is that if the seller changes its name then you have to update every of his products' embedded data. In that case it is not a problem since there are *far* more instances of people listing products than seller changing their names. In the end you get extra performances and almost endless horizontal scalability.

Anyway, I updated my schemas with [references](https://mongoosejs.com/docs/populate.html), set up controllers to handle the routed requests and started to work with my models. To test and debug my API, I used [Postman](https://www.getpostman.com/). In the meantime, I was learning a lot about modern JavaScript [promises](https://developers.google.com/web/fundamentals/primers/promises) which were fundamental due to the asynchronous nature of Node.js.

### Authentication

> npm install passport

At that point, I wanted to start implementing authentication. The most popular solution for Node.js is [Passport](http://www.passportjs.org/) which revolves around strategies. I decided to use the [local strategy](https://github.com/jaredhanson/passport-local), which would handle login by checking an email and password against the database, and the [JWT strategy](https://github.com/themikenicholson/passport-jwt) to handle stateless token based authentication.

I must say that this very basic implementation took me quite some time. Since it was really paramount that I understood every line of code I produced, all the while I was trying to be quick and efficient, I ended up juggling with too many new concepts resulting in brain aches. In this case, a new language, JavaScript, a new framework, Express, and a new authentication mechanism, [JSON Web Tokens](https://en.wikipedia.org/wiki/JSON_Web_Token). I had to read a lot and play around with my code to get results. For instance, at some point, I was trying to login but my user model password comparison method was always returning false. I thought it had something to do with the way I (mis)used [bcrypt](https://www.npmjs.com/package/bcrypt), but instead *realized* that I was using an async call to bcrypt's *compare()* and should therefore implement a callback with the result.

Anyway, it all made me realize I had to slow down a bit and focus on building good foundations before going too far. But on the other hand, apart from the frequent feeling of being completely overwhelmed, I enjoyed learning so much each day.

### Testing

Even though I had a lot on my plate already, I didn't want to go forward without implementing tests first. After reading so much about it, and skimming over it in Rails, I really wanted to lean toward [test-driven development](https://en.wikipedia.org/wiki/Test-driven_development) as soon as possible. Even though it would slow me down even more in the beginning and feel like a tedious process, this is what is justifiably expected of a good developer and as such should become a habit.

> npm install mocha chai --save-dev

I went with [Mocha](https://mochajs.org/) as test runner and [Chai](https://www.chaijs.com/) as assertion library as they were seemingly the most popular solutions.

### The search for an API specification

To write my tests, I obviously needed to settle on a [spec](https://en.wikipedia.org/wiki/Specification_(technical_standard)) first. And yes, I was aware that my advancement was almost comically starting to look like the unstacking of a set of [Russian nesting dolls](https://en.wikipedia.org/wiki/Matryoshka_doll). Regarding APIs, I was looking for some kind of standard. The [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) style came to mind immediately as I had already worked with it in Rails. While I'm not going to list all the constraints, the main idea is that you make *resources* available to clients, who can perform [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations on them using the [HTTP verbs](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods). But it still leaves *a lot* of margin regarding the implementation.

Looking around for more precise guidelines, I came across a lot of standards regarding different aspects of APIs. For instance, there is [OpenAPI](https://www.openapis.org/), inherited from [Swagger](https://swagger.io/), an API specification language which helps you rationalize and describe your interface. It comes with an ever-growing set of tools like a [GUI](https://swagger.io/tools/swagger-editor/) to help you design your endpoints, an auto generator for documentation, or even a generator for scaffolding an Express server with all the routes ready.

I also stumbled upon the [JSON:API](https://jsonapi.org/) which is a *precise* specification bringing in a lot of conventions like exactly how responses should be formatted and so forth. That level of detail allows the existence of [pre-made libraries](https://jsonapi.org/implementations/) for a wide variety of both clients and servers. It advertises itself as an 'anti-[bikeshed](http://bikeshed.org/)ding' tool, a new concept to me, also known as Parkinson's law of triviality, establishing that we often waste a lot of time on trivial details while important matters are left unattended. That's *exactly* what I was feeling, trying to figure out a million details most of which didn't really matter.

That much reading and learning about the subject lead me to the notion of [compound documentation](https://jsonapi.org/format/#document-compound-documents), or maybe in other words, nested resources. To put it very simply, considering it is expensive in terms of time and bandwidth to make multiple API calls to render a single page, it has become good practice to include sub resources in a request. For instance, let's say I need to request a user profile and its last five posts. I first make a GET call the resource URI and then another to the URI intended for associated posts, making a total of two requests. Let's say that instead of just responding with the user data on the first call I would include, preferably on-demand, related data like its last five posts. That would potentially make the client more responsive because of the time and network gain of making a single request, especially in the era of mobile connectivity. Facebook reacted (no pun intended) to this problem by creating [GraphQL](https://graphql.org/), a query language designed, amongst other things, to serve multiple resources on a single request.

Then, a long-awaited game changer made its entrance, [HTTP/2](https://en.wikipedia.org/wiki/HTTP/2). The last HTTP version, 1.1, dated back to 1997, a time when the Internet had very different needs and uses. Simplifying to the extreme again, one of the major change is that this protocol allows multiple requests in a single connection. There is no need to fit it all in a single request anymore. Suddenly we can get rid of all that added complexity from compound documentation or specific query languages and simply make as many resources requests as needed, even in parallel. The downfall to this messianic solution is that HTTP/2 is not *yet* widely spread and it can be a big problem depending on your target clients.

While this digression in the word of API specs and challenges was eye-opening, I had to get back to business. I settled on a very simple RESTFul*ish* implementation of my own making, keeping in mind that the end-goal here is to make a very simple backend and not the perfect interface for a NASA land rover. But I'm pretty confident that I will someday try a design first approach around the [OpenAPI](https://www.openapis.org/) spec as it seems like a very clever way to draft an API.

### Embracing [TDD](https://en.wikipedia.org/wiki/Test-driven_development)

I must say it has been very difficult to get started with TDD. The first thing that was missing is a proper handling of the environment. To do so I simply made a config file import depending on the value of `NODE_ENV`. That allowed me, for instance, to set up a different MongoDB database for my testing environment. I also made my application exportable so that I could import it in my test suites. Then I dived in and decided I wanted to start by testing my API endpoints, no matter the implementation behind it. I chose the [behavior-driven development](https://en.wikipedia.org/wiki/Behavior-driven_development) approach, with the `should` and `expect` verbs, as it matched perfectly in my mind the spirit of TDD. What matters is how my API *behaves* in regard to the client and not the specifics of its internals, at least for now.

Chai comes with the [chai-http plugin](https://www.chaijs.com/plugins/chai-http/) which seemed perfectly able to achieve my current goal. I ended up writing dubiously the first few (failing) tests of my suite. What struck me, *again*, is that it was so much more difficult to get started that in Rails. You pretty much have to do *everything*, build step by step the test environment. There was probably some npm modules which could have simplified the process but again chose to avoid them in order to practice.

### *Fiat lux*

At that point, I had finally some kind of epiphany. I realized that I was battling every day with JavaScript because I was perceiving it as a tangled mess of various layers of features, which it kind of is. But nonetheless I was not able to make much parallels with my experience in [OOP](https://en.wikipedia.org/wiki/Object-oriented_programming) as a [Java](https://en.wikipedia.org/wiki/Java_(programming_language)) developer. I felt so frustrated not being able to translate the developer mindset I grew a few years back. It was time to finally take initiatives and stop trying desperately to follow best practices that could shield me from making my own choices.

The first result was that in order to make the API integration tests as [implementation-agnostic](https://stackoverflow.com/questions/10969057/what-does-implementation-agnostic-mean) as possible, I made a simple interface preventing them from calling directly the implemented database. With that done, I could later easily switch from [mongoose](https://mongoosejs.com/) to an [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping), as planned, without having to touch these test suites. In this context it might be a cannon to kill a mosquito, but it felt right. Anyway, with that interface and my greater confidence, I refactored and augmented my partial test suite with *great* satisfaction.

### DRYing tests

I had a hard time trying to [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) my integrations tests. When the requests params did not fit my validation requirements, I wanted to expect the same 422 HTTP response. I didn't want to hard-code it in every related test, but instead define in a single place what I expected the response to be in that case. If I needed to change those [assertions](https://en.wikipedia.org/wiki/Test_assertion) later, I just had to update it once. That's a very basic and crucial principle of software development.

Anyway, I first tried to DRY at the [request](https://github.com/chaijs/chai-http#setting-up-requests) level, but it became overly complicated as I had to pass a lot of arguments. In my mind, if when trying do DRY your code, it becomes paradoxically longer, less readable and hard to implement, then you are probably going too far or not having the right perspective. Furthermore, I tried to make some chainable function that would return a Promise but again it did not feel right. To be honest it was also probably because I was not too comfortable yet with those notions. I even investigated the option of making a [chai plugin](https://www.chaijs.com/guide/helpers/). In the end, I *simply* grouped the assertions around a single argument, the response. It felt so obvious afterwards, but I learned quite a few things along the way.

Another issue I spent some time on was finding a way to make my tests wait until the application was ready. At that point, the only asynchronous process I had to wait for was the [mongoose](https://mongoosejs.com/) connection. I first tried propagating a callback from the app to my tests, but it felt wrong and messy. Then I remembered events, something I was definitely not used to. The issue then was that it worked only for the first test as the event was only fired once, and also that it could theoretically happen before registering my listener. So I added a `isReady` property to my [Express](https://expressjs.com/) application, which was probably not a very good pattern even if I checked for conflicts first, but that I would evaluate first to determine if the event had already been fired.

### Green is my new black

All the efforts made to set up my [TDD](https://en.wikipedia.org/wiki/Test-driven_development) environment finally paid off. I must say that writing the spec, making sure it fails, implementing it, and then boom, run [mocha](https://mochajs.org/) and it's all green felt *neat*. No need to spend a lot of time on Postman manually testing my code, which could anyway break later without me knowing. Also, coding and fixing the implementation felt like a breeze because most of the thinking and planning went into the specs, I just had to focus on making sure it behaved accordingly and not on why it should behave that way.

I continued to try as much as possible to [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) my tests. For instance I exported the authentication header check in my helper, as well as the request to create a new user as it is used in several places. The result didn't look so organized, but it was good enough at that point. I also fully switched to [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) in my tests, and in the way gained a *much better* understanding of the logic, especially when chaining. Being the underlying concepts behind the [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) [syntactic sugar](https://en.wikipedia.org/wiki/Syntactic_sugar), I was really glad I took the time to work on them.

It would have been all too good if I hadn't been confronted with a new challenge soon after. As I started to efficiently write the API specs for the `project` resource, I wanted to assert that a user could not update a project he wasn't the owner of. For that matter, I needed a project in the database created by a different user than the one authenticated to test it against. I thought about creating a new user using the API, storing its token, performing a project creation with it, and then doing the update test with the first user token. But it felt overly complicated at that time, especially since I would have to do it for other resources.

### Keeping focus

I investigated the use of [factories](https://github.com/rosiejs/rosie) and [fixtures](https://en.wikipedia.org/wiki/Test_fixture#Software), as I had used some during my short [Rails](https://rubyonrails.org/) experience. The problem was that if I started to go around the API endpoints to handle models and database directly, then these integration tests wouldn't be fully [implementation-agnostic](https://stackoverflow.com/questions/10969057/what-does-implementation-agnostic-mean) anymore. Also, it was important that I stayed focus on the end goal of producing a working API in a reasonable time frame. I would certainly have plenty of opportunities to practice these concepts later anyway.

So I went and tried the solution I saw as overly complicated a day before. And it panned out just fine, at least at that point. I just had to make requests to the API in the `before()` hooks to create two different users and switch between them throughout my test suites. The same went for the other resources as I could create them during tests and store their ids for later use. I was finally able, *at last*, to write the first drafts of the API integration tests for the `project` and `activity` resources.

### Hard work

I was finally able to write the API implementation, route by route, following the path laid by my tests. I must say it was quite enjoyable, as it was the code which *got the job done*. It made me work on my new JavaScript skills as well as model validation and handling with [mongoose](https://mongoosejs.com/), all the while I had the comfort of knowing that if I broke something I would know. However, I did not want to go too far regarding the refactoring step of the [TDD](https://en.wikipedia.org/wiki/Test-driven_development) cycle as I wanted to get a fully working implementation first. But it was not all rainbows and butterflies as things got complicated, again.

There were times when I stumbled upon mistakes in my integration tests. But there were also times when I realized some tests were not thorough enough, or even worse, actually not testing what was described and displayed a deceitful green. For instance, this time tracking application was meant to handle time segments and had a key constraint which is that two of those segments, called activities, could not overlap. In other words, a user could not have two activities at the same time, making mono-tasking mandatory in a way. It might have seemed simple and obvious, but it meant a lot more checks in my test suite that I had anticipated. I had clearly not given it enough thought and made a note to self to go more in-depth next time.

Another *big* issue was that my tests were co-dependent, a result of the workaround to not using fixtures I mentioned earlier. My tests therefore worked in cascade. For instance, if a test failed and some data was consequently not stored, then some later test would fail because it depended upon that same data. This system added a lot of complexity to spec writing, as I had to know what was stored at each point, and made the whole a lot less readable. Furthermore, it also made some test results irrelevant as a red could come from the failure of another test and not directly from an issue with what was described. What came to mind at that point was that preventing those integration tests from adding data directly to the database led to disproportionate complications.

Albeit these issues, my progress was significant. I was not far from a fully implemented spec for a first version of the API. But it still lacked pagination and version handling amongst other things.

### It's a wrap

The remaining features, in both tests and implementations, were done in a much shorter time than anticipated. I was really eager to do some kind of feature freeze and a final code review. Something I noticed, which I took for a good sign, is that I had not been reading tutorials for quite some time. It had only been my [IDE](https://en.wikipedia.org/wiki/Integrated_development_environment), libraries docs and the occasional StackOverflow visits. They helped me to get started but I had progressively build enough confidence to pursue my own ideas.

Anyway, I was quite satisfied with how much I had learned along the way. It had been such a big leap for me in terms of paradigm. The language I had had the most knowledge and experience with had been Java, which is class-based OOP and strongly typed, whereas JavaScript is prototype-based OOP and weakly typed. Some say that Java is to JavaScript what ham is to hamster. And the only web framework I had worked with before was [Rails](https://rubyonrails.org/), which is very opinionated, comes with lots of generators to scaffold code and advocates convention over configuration. [Express](https://expressjs.com/), on the other hand, is *quite* the opposite as it is very minimalist and mainly handles routing and middleware stacking. All those concepts were unknown to me only a few weeks back, and now seemed so familiar.

### What's next

With now a Node.js back-end API to work with, it was time to dive into the realm of front-end JavaScript frameworks and continue my [coding journey](https://github.com/stoneLeaf/coding-journey). I will probably come back to this API to fix bugs and add features I might deem necessary.

Some hints as to what could be improved:

- input sanitation/validation
- token revocation (JWT blacklist), OAUth 2.0
- response headers
- [absolute paths for require()](https://gist.github.com/branneman/8048520)
- performance, with indexes amongst other things
- security
- unit testing

Some bigger changes could also be made:

- GraphQL instead of REST
- ORM instead of mongoose
- TypeScript

## License

This project is under the [MIT license](LICENSE).
