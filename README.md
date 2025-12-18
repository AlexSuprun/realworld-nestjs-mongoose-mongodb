# ![RealWorld Example App](logo.png)

> ### NestJS codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.


### [Demo](https://demo.realworld.io/)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)


This codebase was created to demonstrate a fully fledged fullstack application built with NestJS including CRUD operations, authentication, routing, pagination, and more.

We've gone to great lengths to adhere to the NestJS community styleguides & best practices.

For more information on how this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.


# How it works

This implementation uses NestJS connected to a MongoDB database. Database operations are handled with Mongoose ODM.

# Getting started

## Prerequisites

- Node.js (v16 or higher)
- Docker (recommended) or MongoDB installed locally

## Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/conduit` |
| `SECRET` | JWT secret key for authentication | `your-secret-key` |

## MongoDB Setup (Docker - Recommended)

Start MongoDB using Docker:

```bash
docker run -d --name mongo-conduit -p 27017:27017 mongo:8
```

### With Replica Set (required for transactions)

If you need transaction support, run MongoDB as a replica set:

```bash
docker run -d --name mongo-conduit -p 27017:27017 mongo:8 --replSet rs0 && sleep 2 && docker exec mongo-conduit mongosh --eval "rs.initiate()"
```

Update your connection string in `.env`:

```
DATABASE_URL=mongodb://localhost:27017/conduit?replicaSet=rs0
```

### Managing the container

To stop MongoDB:

```bash
docker stop mongo-conduit
```

To start it again:

```bash
docker start mongo-conduit
```

## Installation

```bash
npm install
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

The API will be available at `http://localhost:3333/api`

## API Documentation

This project includes Swagger/OpenAPI documentation. Once the server is running, access the interactive API documentation at:

- **Swagger UI**: http://localhost:3333/docs
- **OpenAPI JSON**: http://localhost:3333/docs-json

The Swagger UI allows you to explore and test all API endpoints directly from your browser.

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
