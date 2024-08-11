//app.module.ts
import { appRouter } from "./app.router.js"; // or "./app.router" if you are using CommonJS
import { Module } from "depsi";
import { Logger } from "./app.service.js"; // or "./app.service" if you are using CommonJS

export const appModule = new Module({
  imports: [],
  providers: [Logger],
  routes: [appRouter],
});
