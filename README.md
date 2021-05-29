# Authory take-home assignment solution

## Description

This solution has been implemented using [Nest](https://github.com/nestjs/nest) framework TypeScript.

## Pre-requisites
- PostgreSQL installation either on local or using docer

```
$ docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -d -p 5432:5432 postgres
```

## Installation

```bash
$ npm install
```

## Running the app
Please update postgresql connection string in `.env.example` and rename `.env.example` to `.env`
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test
Please start postgresql to successfully execute the tests and update `.env` file with connection string.
```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Exposed APIs
- API to retrieve share count analytics.
```
GET /analytics?from=<date>&to=<date>&orderBy=all
```
All query parameters are optional. The supported values for `orderBy` are `facebook, twitter, pinterest, linkedin, all`.
The expected date format for `to` and `from` is `ISO 8601`

- API for health check
```
GET /ping
```
