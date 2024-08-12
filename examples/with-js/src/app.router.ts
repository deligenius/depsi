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
