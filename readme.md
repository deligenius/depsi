# Depsi

> Super power your Express.js with dependency injection

[![TypeScript](https://img.shields.io/badge/--3178C6?logo=typescript&logoColor=ffffff)](https://www.typescriptlang.org/)
[![Npm package version](https://badgen.net/npm/v/depsi)](https://www.npmjs.com/package/depsi)
![npm](https://img.shields.io/npm/dw/depsi)
![NPM](https://img.shields.io/npm/l/depsi)
![GitHub Repo stars](https://img.shields.io/github/stars/deligenius/depsi?style=social)

`depsi` is a dependency injection library for Node.js, designed to work seamlessly with Express.js, TypeScript or JavaScript.

- Progressive DI(Dependency injection) framework for Express.js
- Super lightweight - 5 kb, or 12.7 kb unpacked
- Supports ESM module.
- Support both of TypeScript and JavaScript

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
  - [Inject `DynamicModule` in router](#inject-dynamicmodule-in-router)
<details>
<summary><h2>Quick Start</h3></summary>

### Installation

```bash
npm install depsi express @types/express
```

### Basic Setup

```typescript
//app.ts
import express from "express";
import { appModule } from "./app.module.js";

async function main() {
  const app = express();

  const routes = await appModule.register();
  for (const router of routes) {
    app.use(router.prefix, router);
  }

  app.listen(3000, () => {
    console.log("listen on port 3000");
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
import { Depends, Router, createRouter } from "depsi";
import { Logger } from "./app.service.js";

export const appRouter = createRouter("/");

appRouter.get("/hi", (req, res) => {
  res.send("hi");
});

appRouter.get("/test", (req, res, next, logger = Depends(Logger)) => {
  logger.log("log from /test");

  res.send("hello world from /test");
});
```

```typescript
//app.module.ts
import { appRouter } from "./app.router.js";
import { Module } from "depsi";
import { Logger } from "./app.service.js";

export const appModule = new Module({
  imports: [],
  providers: [Logger],
  routes: [appRouter],
});
```

### You're good to go

now run your app and `curl localhost:3000/test` to see the magic!

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

The order of providers matters, `depsi` register providers from left to right.

```ts
export const appModule = new Module({
  imports: [],
  providers: [Logger, Service],
  routes: [],
});
```

## Depends

The Depends function is used to inject dependencies into route handlers.

### Using Depends in a Route

```typescript
import { createRouter, Depends } from "depsi";
import { Logger } from "./app.service.js";

const appRouter = createRouter("/");

appRouter.get("/test", (req, res, next, logger = Depends(Logger)) => {
  logger.log("log from /test");
  res.send("hello world from /test");
});
```

## Router

Routers are used to define routes within a module.

### Creating a Router

```typescript
import { createRouter, Depends } from "depsi";
import { Logger } from "./app.service.js";

export const appRouter = createRouter("/");

appRouter.get("/hi", (req, res) => {
  res.send("hi");
});
```

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

## Dynamic Modules

Dynamic modules allow you to provide dynamic providers that can be asynchronously resolved.

### Creating and using a Dynamic Module

```typescript
import { Module, DynamicModule } from "depsi";

class MyClass {
  static TOKEN = "token_of_MyClass";
  constructor() {}

  test() {
    console.log("Test in MyClass");
  }
}

// register dynamic module
export const myModule = new Module({
  imports: [
    new DynamicModule({
      token: MyClass.TOKEN,
      getProvider: async () => new MyClass(),
    }),
  ],
  routes: [],
  providers: [],
});

// Use it in router:
import { Depends } from "depsi";

router.get("/", (req, res, next, myclass: MyClass = Depends(MyClass.TOKEN)) => {
  myclass.test();
  res.send("Test route");
});

// Use it in class constructor:
import { Inject, Injectable } from "depsi";

@Injectable()
class Logger {
  constructor(@Inject(MyClass.TOKEN) myclass: MyClass) {}
}
```

# Usage for JavaScript

## Dependency Injection in class constructor

JavaScript doesn't provide type information in class constructor that allows us to inject in a normal way. Fortunatelly we can inject in by `@Inject(className)`.

```javascript
import { Injectable, Inject } from "depsi";

@Injectable()
export class TestLogger {
  /**
   * Optional type declaration
   * @param {MyClass} logger 
   */
  constructor(@Inejct(Logger.name) logger) {
    logger.log("TestLogger");
  }
}
```

## Inject `DynamicModule` in router

We still use `Depends(token)` to inject dynamic module provider, but for your convenience, it's probabally better to add type declaration for it.

```javascript
const { createRouter, Depends } = require("depsi");
const { Logger } = require("./app.service.js");

const testRouter = createRouter("/");

testRouter.get(
  "/",
  (
    req,
    res,
    next,
    logger = Depends(Logger),
    /** @type {MyClass} */
    myclass = Depends(MyClass.TOKEN)
  ) => {
    myclass.test();
    res.send("Test route");
  }
);
```

# Credits

Contributors: [Jun Guo @gjuoun](https://github.com/gjuoun)
