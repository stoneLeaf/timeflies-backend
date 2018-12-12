# timeflies-backend

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) ![Work in progress](https://img.shields.io/badge/work-in%20progress-red.svg)

TimeFlies Node.js backend.

TimeFlies is a time tracking app coded for the sole purpose of learning.

## Development journal

As with my [coding journey](https://github.com/stoneLeaf/coding-journey), I will try to lay out my chain of thoughts and progress, adding insights to the commit history.

### Framework

> npm init

> npm install express

Choosing [Winston](https://github.com/winstonjs/winston) for general logging, with [some configuration](https://thisdavej.com/using-winston-a-versatile-logging-library-for-node-js/), and [Morgan](https://github.com/expressjs/morgan) for HTTP requests logging.

> npm install winston morgan

At that point I started to create the Node app entry point, *app.js* here, and needed to understand the [concept of middleware](https://expressjs.com/en/guide/using-middleware.html). I had to figure out what *app.use()* does, how paths are handled, the use of the *[next()](https://stackoverflow.com/a/13133140/8853013)* function and how middlewares are stacked. It was also very important that I learned [how CommonJS modules work](https://blog.risingstack.com/node-js-at-scale-module-system-commonjs-require/), understanding the *module.exports* and *require* duo. On a side note, it might be an obvious resource but I found the [Express API reference](https://expressjs.com/en/api.html) very helpful and well done.

Concerning routing, I decided to use Express router modules in chains to get a clean structure for the API routes. Express being very unopinionated, I spent a lot of time looking for best practices in articles and existing code. While it gave me some direction, it became *very* clear that, contrary to my *modest* [Rails](https://rubyonrails.org/) background, I had to make my own choices regarding almost every aspect of my architecture.

### Models

Although I intended to use an ORM, I thought that I had to try [MongoDB](https://www.mongodb.com/) first. Being the most common solution amongst Node stacks, it seemed important to have some working knowledge of it.

> npm install [mongoose](https://github.com/Automattic/mongoose)

I must say I was unexpectedly impressed by mongoose's API. Schemas come with quite a few [helpers for validation](https://mongoosejs.com/docs/schematypes.html#schematype-options) and you can simulate joins with the [*populate()*](https://mongoosejs.com/docs/populate.html) method. Anyway, the first step was reading the [docs](https://mongoosejs.com/docs/), which are quite comprehensive and were a must read for a newcomer like myself.

Same thing about schema design and (pseudo) relationships, I stumbled upon a [3 parts article](https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design-part-1) which helped me a great deal. At that point, I had 3 models: User, Project, and Activity. A user has many projects and activities. A project belongs to one user and has many activities. An activity belongs to one user and one project. I went with basic one-way referencing schemas for practice. In the meantime, I felt like I should have chosen a better case for this MongoDB *initiation* even so I knew from the start a relational database was more adequate for this app. But at least it gave me a concrete example of what it was not suited for.

From what I had gathered so far, [NoSQL](https://en.wikipedia.org/wiki/NoSQL) databases like MongoDB are suited for (big) collections of, potentially non-normalized, data. Their benefits are high horizontal scalability, as you can easily split collections amongst servers, and very fast reads. For instance, in an online store, let's say we have of collection of products for a specific category. In each product entry you would embed its seller core data such as its name and id. Then when listing those products, you wouldn't have to join the seller table to get each product's seller name, since it's already embedded in each product. The downside is that if the seller changes its name then you have to update every of his products' embedded data. In the balance it doesn't really matter because there are *far* more instances of people listing products than seller changing their names. In the end you get extra performance and almost endless potential scalability.

Anyway, I updated my schemas with references, created controllers to handle the routed requests and started to work with my models. To test and debug my API, I used [Postman](https://www.getpostman.com/). In the meantime, I was learning a lot about modern JavaScript [promises](https://developers.google.com/web/fundamentals/primers/promises) which were fundamental due to the asynchronous nature of Node.

### Authentication

> npm install passport

At that point, I wanted to start implementing authentication in my app. The most popular solution for Node.js is [Passport](http://www.passportjs.org/) which revolves around strategies. I decided to use the [local strategy](https://github.com/jaredhanson/passport-local), which would handle login by checking email and password against the database, and the [JWT strategy](https://github.com/themikenicholson/passport-jwt) to handle stateless token based authentication.

I must say that this very basic implementation took me quite some time! Since it is really paramount that I understand every line of code I produce, and since I'm trying to go very fast, I end up juggling with a lot of new concepts and having brain aches. In this case, a new language, JavaScript, a new framework, Express, and a new authentication mechanism, [JSON Web Tokens](https://en.wikipedia.org/wiki/JSON_Web_Token). I had to read a lot and play around with my code to get results. For instance, at some point, I was trying to login but my user model password comparison method was always returning false. I thought it had something to do with the way I (mis)used [bcrypt](https://www.npmjs.com/package/bcrypt), but instead *realized* that I was using an async call to bcrypt's *compare()* and should therefore implement a callback with the result.

Anyway, it all made me realize I should probably slow down a bit and focus on building good foundations before going too far. But on the other hand, apart from the frequent feeling of being completely overwhelmed, I enjoy learning so much every day.

### Testing

Even though I had a lot on my plate already, I didn't want to go forward without implementing tests first. After reading so much about it, and skimming over it in Rails, I really wanted to lean toward [test-driven development](https://en.wikipedia.org/wiki/Test-driven_development) as soon as possible. Even though it would slow me down even more in the beginning and feel like a tedious process, this is what is justifiably expected of a good developer and should become a habit.

> npm install mocha chai --save-dev

I went with [Mocha](https://mochajs.org/) as test runner and [Chai](https://www.chaijs.com/) as assertion library as they were seemingly the most popular solutions.

### The search for an API specification

To write my tests, I obviously needed to settle on a [spec](https://en.wikipedia.org/wiki/Specification_(technical_standard)) first. And yes, I was aware that my advancement was almost comically starting to look like the unstacking of a set of [Russian nesting dolls](https://en.wikipedia.org/wiki/Matryoshka_doll). Regarding APIs, I was looking for some kind of standard. The [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) style came to mind immediately as I had already worked with it in Rails. While I'm not going to list all the constraints, the main idea is that you make *resources* available to clients, who can perform [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations on them using the [HTTP verbs](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods). But it still leaves *a lot* of margin regarding the implementation.

Looking around for more precise guidelines, I came across a lot of standards regarding different aspects of APIS. For instance, there is [OpenAPI](https://www.openapis.org/), inherited from [Swagger](https://swagger.io/), an API specification language which helps you rationalize and describe your interface. It comes with an ever-growing set of tools like a [GUI](https://swagger.io/tools/swagger-editor/) to help you design your endpoints, an auto generator for documentation, or even a generator for scaffolding an Express server with all the routes ready.

I also stumbled upon the [JSON:API](https://jsonapi.org/) which is a *precise* specification bringing in a lot of conventions like exactly how responses should be formatted and so forth. That level of detail allows the existence of [pre-made libraries](https://jsonapi.org/implementations/) for a wide variety of both clients and servers. It advertises itself as an 'anti-[bikeshed](http://bikeshed.org/)ding' tool, a new concept to me, also known as Parkinson's law of triviality, establishing that we often waste a lot of time on trivial details while important matters are left unattended. That's *exactly* what I was feeling, trying to figure out a million details most of which didn't really matter.

That much reading and learning about the subject lead me to the notion of [compound documentation](https://jsonapi.org/format/#document-compound-documents), or maybe in other words, nested resources. To put it very simply, considering it is expensive in terms of time and bandwidth to make multiple API calls to render a single page, it has become good practice to include sub resources in a request. For instance, let's say I need to request a user profile and its last five posts. I first make a GET call the resource URI and then another to the URI intended for associated posts, making a total of two requests. Let's say that instead of just responding with the user data on the first call I would include, preferably on-demand, related data like its last five posts. That would potentially make the client more responsive because of the time and network gain of making a single request, especially in the era of mobile connectivity. Facebook reacted (no pun intended) to this problem by creating [GraphQL](https://graphql.org/), a query language designed to serve multiple resources on a single request.

Then, a long-awaited game changer made its entrance, [HTTP/2](https://en.wikipedia.org/wiki/HTTP/2). The last HTTP version, 1.1, dated back to 1997, a time when the Internet had very different needs and uses. Simplifying to the extreme again, one of the major change is that this protocol allows multiple requests in a single connection. There is no need to fit it all in a single request anymore. Suddenly we can get rid of all that added complexity from compound documentation or specific query languages and simply make as many resources requests as needed, even in parallel. The downfall to this messianic solution is that HTTP/2 is not *yet* widely spread and it can be a big problem depending on your target clients.

While this digression in the word of API specs and challenges was eye-opening, I had to get back to business. I settled on a very simple RESTFul*ish* implementation of my own making, keeping in mind that the end-goal here is to make a very simple backend as a learning exercise and not the perfect interface for a NASA land rover. But I'm pretty confident that I will someday try a design first approach around the [OpenAPI](https://www.openapis.org/) spec as it seems like a very clever way to draft an API.

### Embracing [TDD](https://en.wikipedia.org/wiki/Test-driven_development)

I must say it has been very difficult to get started. The first thing that was missing is a proper handling of the environment. To do so I simply made a config file import depending on the value of NODE_ENV. That allowed me for instance to set up a different MongoDB database for my testing environment. I also made my app exportable so that I could import it in my test suites. Then I dived in and decided I wanted to start by testing my API endpoints, no matter the implementation behind it. I chose the [behavior-driven development](https://en.wikipedia.org/wiki/Behavior-driven_development) approach, with the *should* and *expect* verbs, as it matched perfectly in my mind the spirit of TDD. What matters is how my API *behaves* in regard to the client and not the specifics of its internals, at least for now.

Chai comes with the [chai-http plugin](https://www.chaijs.com/plugins/chai-http/) which seemed perfectly able to achieve my current goal. I ended up writing dubiously the first few (failing) tests of my suite. What struck me, *again*, is that it's so much more difficult to get started that in Rails. You pretty much have to do *everything*, build step by step the test environment. There's probably some npm modules which help you simplify some of it but again I think I should avoid them if I want to learn.

### *Fiat lux*

At that point, I had finally some kind of epiphany. I realized that I battling every day with JavaScript because I was perceiving it as a tangled mess of various layers of features, which it kind of is. But nonetheless I was not able to make much parallels with my experience in [OOP](https://en.wikipedia.org/wiki/Object-oriented_programming) as a [Java](https://en.wikipedia.org/wiki/Java_(programming_language)) hobbyist. I felt so frustrated not being able to translate the developer mindset I grew a few years back. It was time to finally take initiatives and stop trying desperately to follow best practices or whatever could shield me from making choices.

The first *modest* result was that in order to make the API integration tests as implementation-agnostic possible, I made a simple interface preventing them from calling directly the implemented database. With that done, I could later easily switch from [mongoose](https://mongoosejs.com/) to an [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping), as planned, without having to touch these test suites. In this context it might be a cannon to kill a mosquito, but it felt good. Anyway, with that interface and my newfound confidence, I refactored and augmented my partial test suite with *great* satisfaction.

### DRYing tests

I had a hard time trying to [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) my integrations tests. When the requests params did not fit my validation requirements, I wanted to expect the same 422 HTTP response. I didn't want to hard-code it in every related test, but instead define in a single place what I expect the response to be in that case. If I need to change those [assertions](https://en.wikipedia.org/wiki/Test_assertion) later, I just need to update it once. That's a very basic and crucial principle of software development.

Anyway, I first tried to DRY at the [request](https://github.com/chaijs/chai-http#setting-up-requests) level, but it became overly complicated as I had to pass a lot of arguments. In my mind, if when trying do DRY your code, it becomes paradoxically longer, less readable and hard to implement, then you are probably going too far or not having the right perspective. Furthermore, I tried to make some chainable function that would return a Promise but again it did not feel right, but to be honest it was also probably because I'm not too comfortable yet with those notions. I even investigated the option of making a [chai plugin](https://www.chaijs.com/guide/helpers/). In the end, I *simply* grouped the assertions around a single argument, the response. It felt so obvious afterwards, but I learned quite a few things along the way.

Another issue I spent some time on was finding a way to make my tests wait until the app is ready. At that point, the only async process I had to wait for was the [mongoose](https://mongoosejs.com/) connection. I first tried propagating a callback from the app to my tests, but it felt wrong and messy. Then I remembered events, something I'm definitely not used to ! The issue then was that it worked only for the first test as the event was only fired once, and also that it could theoretically happen before registering my listener. So I added a *isReady* property to my [Express](https://expressjs.com/) app, which is probably something not so great even if I checked for conflicts first, that I would evaluate first to determine if the event had already been fired.

### Green is my new black

All the efforts made to set up my [TDD](https://en.wikipedia.org/wiki/Test-driven_development) environment finally paid off! I must say that writing the spec, making sure it fails, implementing it, and then boom, run [mocha](https://mochajs.org/) and it's all green felt *neat*. No need to fire up Postman to manually test my code, which could anyway break later without me knowing. Also, coding and fixing the implementation felt like a breeze because most of the thinking and planning went into the specs, I just had to focus on making sure it behaved accordingly and not on why it should behave that way.

I continued to try as much as possible to DRY my tests. For instance I exported the authentication header check in my helper, as well as the request to create a new user as it is used in several places. The result looked not so great and organized, but it was good enough at that point. I also fully switched to [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) in my tests, and in the way gained a *much better* understanding of the logic, especially when chaining. Being the underlying concepts behind the [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) [syntactic sugar](https://en.wikipedia.org/wiki/Syntactic_sugar), I was really glad I took the time to work on them.

It would have been all too good if I hadn't been confronted with a new challenge soon after. As I started to efficiently write the API specs for the 'project' resource, I wanted to assert that a user could not update a project he wasn't the owner of. For that matter, I needed a project in the database created by a different user than the one authenticated to test it against. I could have created a new user using the API, stored its token, perform a project creation with it, and then do the update test with the first user token. But it felt overly complicated, especially since I would have to do it for other resources.

### Keeping focus

I investigated the use of [factories](https://github.com/rosiejs/rosie) or [fixtures](https://en.wikipedia.org/wiki/Test_fixture#Software), as I had used some during my modest [Rails](https://rubyonrails.org/) experience. The problem was that if I started to go around the API endpoints to handle models and database directly, then these integration tests wouldn't be fully [implementation-agnostic](https://stackoverflow.com/questions/10969057/what-does-implementation-agnostic-mean) anymore. Also, it was important that I stayed focus on the end goal of producing a working API in a reasonable time frame. I would certainly have plenty of opportunities to practice these concepts later anyway.

So I went and tried the solution I saw as overly complicated a day before. And it panned out just fine, even went as fairly easy and clean. I just had to make requests to the API in the *before()* hooks to create two different users and switch between them throughout my test suites. The same went for the other resources as I could create them during tests and store their ids for later use.
