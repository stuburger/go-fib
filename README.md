# Fullstack Fibonacci coding challenge

This repository contains my solution to the [fibonacci coding challenge](https://gist.github.com/stepanbujnak/7fa18e2e97de2fd3f593c00b09c445c2). It is built the following stack:

- AWS CDK and [SST](https://sst.dev/) for Infrastructure as Code
- Go for the backend.
- Vite + React for the frontend.
- Dynamodb is used for persistence.

Note that there are actually 2 implemented backends. There is a serverless approach as well as a container based approach. The former deploys a single lambda function fronted by an API gateway and the latter deploys a simple http server to AWS ECS fronted by a cloudfront distribution.

The reason I ended up with multiple backends is because in testing the lambda approach didn't always meet the ~1000 request/second throughput requirement. Leaving in the serverless version costs me nothing and it might be interesting to you to see how it was done.

Both backends use the same Dynamodb table for persistence. Both APIs support the same http routes:

- `/current` - returns the current number in the sequence
- `/next` - returns the next number in the sequence
- `/previous` - returns the previous number in the sequence
- `/reset` - reset to the first number in the sequence

## Demo

- Website is deployed to [https://pex.stuburger.com/](https://pex.stuburger.com/)
- Serverless backend is accessible from [https://1i3560emy0.execute-api.us-east-1.amazonaws.com](https://d22iwr85mk90es.cloudfront.net/)
- Containerized backend is accessible from: [https://d2b3eagqriav7g.cloudfront.net](https://d2b3eagqriav7g.cloudfront.net)

## Requirements

- [pnpm](https://pnpm.io/installation) for node package management
- Go language runtime
- Docker (for the server backend)
- [k6](https://k6.io/) if you want to run the load tests

## Initial setup

Clone repo and install dependencies

```bash
$ git clone git@github.com:stuburger/go-fib.git
$ cd go-fib
$ pnpm i
```

## Deploying to AWS

Ensure you have AWS credentials configured. If you are using aws profiles then tac on `--profile you-profile` onto the end of the deploy command. Then deploy using:

```bash
$ npx sst deploy --stage pex
```

This will take a few minutes (mostly due to the time it takes to spin up ECS tasks). Once done, take note of the output in your terminal. You should be able to navigate to the deployed website using the automatically generated cloudfront domain you are given.

Note that the `stage` name is arbitrary here. If you choose a different stage, make sure to use the same stage across the other commands too.

## Running API tests

These tests actually hit deployed endpoints so make sure you've deployed the app first.

```bash
$ pnpm run test --stage pex
```

## Running load tests

I've included only a very simple load test. For more information take a look at [/tests/loadtest.js](/tests/loadtest.js). It simply ramps up to 1000 requests per second in a 30 second period.

Make sure you have k6 load testing tool installed. If you're on mac like I am you can simply install using homebrew:

```bash
$ brew install k6
```

Run the load tests:

```bash
$ pnpm run load-test --stage pex
```

## Quick tour of the code

### Infrastructure

Infra is separated out into 4 separate stacks:

- [Storage](/stacks/storage.ts) (provisions Dynamodb table and seeds it with initial data using a lambda function)
- [ApiGateway](/stacks/api-gateway.ts) (provisions api gateway and lambda backend handler)
- [Ecs](/stacks/ecs.ts) (provisions vpc, alb, fargate service, auto scaling group, ecr and cloudfront distribution)
- [Website](/stacks/website.ts) (deploys the frontend build assets to an s3 bucket and provisions cloudfront distribution)

### Fibonacci algorithm

See [fib.go](./fib/fib.go) for the implementation.

Both backends pre-populate the fibonacci numbers to the 50th element. I chose that number arbitrarily and in fact this pre caching solution doesn't actually seem to give much benefit once I moved to a serverful approach. I've left it in there as a small optimization, however.

The algorithm also uses a dynamic programming approach instead of a recursive approach which is much faster.

Assumptions:

- You're not going to hit the /previous endpoint to drive the counter into negative numbers doing so will simply return an error.

### Persistence

See [counter.go](./db/counter.go) for the implementation.

The dynamodb table will only ever have a single value in it which is used to keep track of the current position in the sequence.

There are 2 functions that provide abstractions around the database:

- `GetCurrentCounterValue` returns the current position in the sequence
- `IncrementCounter` increases or decreases the position in the sequence by a value n. (use -1 for decrement)

These functions are called in both the lambda and server backends and provide enough throughput for to meet the requires of the exercise.

### Website

The website is simply a static site and is serviced by a cloudfront CDN. You can see the sample version at https://pex.stuburger.com.

I have chosen to leave it bare bones for this challenge. It does not make use of any CSS pre-processors, although these days I'm inclined to reach for tailwindcss before anything else.

## Additional info

I chose SST because makes it very easy to create a deploy cloudformation stacks. It is built on top of AWS CDK and make its trivial to build serverless applications in particular. It also provides the means to move entirely away from storing environment variables in config files which are often need to store secrets and are at risk of being committed to version control.

When you run the api tests or load tests, notice that those tests do not pull in any configuration from local files. It is all done using `sst bind` which binds the apps resources to a command and brings those variables into the environment. Magic!

It is also possible to reuse the same CDN for the website and the backend by pointing it at different origins, but thats been left for part 2 :)
