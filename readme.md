# Depsi

[![TypeScript](https://img.shields.io/badge/--3178C6?logo=typescript&logoColor=ffffff)](https://www.typescriptlang.org/)
[![Npm package version](https://badgen.net/npm/v/depsi)](https://www.npmjs.com/package/depsi)
![npm](https://img.shields.io/npm/dw/depsi)
![NPM](https://img.shields.io/npm/l/depsi)
![GitHub Repo stars](https://img.shields.io/github/stars/deligenius/depsi?style=social)

`depsi` is a nest.js like dependency injection library for Express.js (Node.js), provide progressive way to add super power to your old or new project!

- Progressive DI(Dependency injection) framework for Express.js
- Super lightweight - (8 kb source code)
- Supports both of CommonJS and ESM module.
- Support both of TypeScript and JavaScript (w/ tsconfig.json)

## Table of content

- [Quick Start](#quick-start)
- [API Usage](#api-usage)
  - [Module](#module)
  - [Injectable](#injectable)
  - [Depends](#depends)
  - [Router](#router)
- [Advanced Topics](#advanced-topics)
  - [Nested Modules](#nested-modules)
  - [Dynamic Modules](#dynamic-modules)
- [Usage for Javascript](#usage-for-javascript)
  - [Dependency Injection in class constructor](#dependency-injection-in-class-constructor)

<details><summary><h2>Quick Start</h3></summary>

### Installation

```bash
npm install depsi express @types/express
```

### Update tsconfig.json

Make sure these options are `true` in your `tsconfig.json`

- `experimentalDecorators`
- `emitDecoratorMetadata`

```json
{
  "compilerOptions": {
    //... other options
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Basic Setup

You'll need to create 4 files to get started, here is our recommended setup.

```typescript
// app.ts
import express from "express";
import { initializeModule } from "depsi";
import { appModule } from "./app.module.js";

async function main() {
  const app = express();

  initializeModule(app, appModule);

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}
main();
```

```typescript
//app.service.ts
import { Injectable } from "depsi";

@Injectable()
export class Logger {
  log(message: string) {
    console.log(message);
  }
}
```

```typescript
//app.router.ts
import { createRouter } from "depsi";
import { Logger } from "./app.service.js"; // or "./app.service" if you are using CommonJS
import { appModule } from "./app.module.js";

// "/" is the prefix of the router
export const appRouter = createRouter("/");

appRouter.get("/hi", (req, res) => {
  res.send("hi");
});

appRouter.get("/test", (req, res, next) => {
  // we can resolve the Logger service from the appModule
  const logger = appModule.resolve(Logger);
  logger.log("log from /test");

  res.send("hello world from /test");
});
```

```typescript
//app.module.ts
import { appRouter } from "./app.router.js"; // or "./app.router" if you are using CommonJS
import { Module } from "depsi";
import { Logger } from "./app.service.js"; // or "./app.service" if you are using CommonJS

export const appModule = new Module({
  imports: [],
  providers: [Logger],
  routes: [appRouter],
});
```

### You're good to go

Now, run your app and see your log by hitting
`curl localhost:3000/test`

</details>

# API Usage

## Module

Modules are the basic building blocks in depsi. They allow you to group providers and routes together.

### Creating a Module

```typescript
import { Module } from "depsi";
import { Logger } from "./app.service.js";
import { appRouter } from "./app.router.js";

export const appModule = new Module({
  imports: [],
  providers: [Logger],
  routes: [appRouter],
});
```

## Injectable

Use the `@Injectable` decorator to mark a class as a provider that can be injected.

### Creating an Injectable Service

```typescript
import { Injectable } from "depsi";

@Injectable()
export class Logger {
  log(message: string) {
    console.log(message);
  }
}
```

### Inject class into other class

```ts
@Injectable()
export class Service {
  constructor(private logger: Logger) {}

  execute() {
    this.logger.log("Service is executing...");
  }
}
```

### Register providers in a module

`Injectable` class shoule be registered in a module always.

The order of providers matters, `depsi` register providers from left to right.

```ts
export const appModule = new Module({
  imports: [],
  providers: [Logger, Service],
  routes: [],
});
```

## Resolve Class Instance

The `module.resolve` function is used to resolve and get the instance for any `Injectable` class.

### Using Depends in a Route

```typescript
import { createRouter, Depends } from "depsi";
import { Logger } from "./app.service.js";
import { appModule } from "./app.module.js";

const appRouter = createRouter("/");

appRouter.get("/test", (req, res, next) => {
  const logger = appModule.resolve(Logger);
  logger.log("log from /test");
  res.send("hello world from /test");
});
```

## Router

Routers are used to define routes within a module, also depsi's `Router` is compatible with Express.js.

### Creating a Router

```typescript
import { createRouter, Depends } from "depsi";
import { Logger } from "./app.service.js";

export const appRouter = createRouter("/"); // define the prefix for the router

appRouter.get("/hi", (req, res) => {
  res.send("hi");
});
```

###

# Advanced Topics

## Nested Modules

Modules can import other modules to organize your application better.

### Creating a Nested Module

```typescript
import { Module } from "depsi";
import { Logger } from "./app.service.js";
import { appRouter } from "./app.router.js";

const subModule = new Module({
  imports: [],
  providers: [Logger],
  routes: [],
});

export const appModule = new Module({
  imports: [subModule],
  providers: [],
  routes: [appRouter],
});
```

# Usage for JavaScript

> If you have JS code mixed with TS code, this is the guide for it.
> Make sure you have these in the `tsconfig.json`

```json
{
  "compilerOptions": {
    //... other options
    "allowJs": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Dependency Injection in class constructor

JavaScript doesn't provide type information in class constructor that allows us to inject in a normal way. Fortunatelly we can inject in by `@Inject(class)`.

```javascript
import { Injectable, Inject } from "depsi";

@Injectable()
export class TestLogger {
  /**
   * Optional type declaration
   * @param {Logger} logger
   */
  constructor(@Inejct(Logger) logger) {
    logger.log("TestLogger");
  }
}
```

Other usage are all the same. Please keep in mind this special usage is for vanilla javascript only.

# Credits

Contributors: [Jun Guo @gjuoun](https://github.com/gjuoun)
