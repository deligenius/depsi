//app.module.ts
import { appRouter } from "./app.router.js"; // or "./app.router" if you are using CommonJS
import { Module } from "depsi";
import { Logger } from "./app.service.js"; // or "./app.service" if you are using CommonJS
import { jsModule } from "./jsmodule/jsmodule.module.js";

export const appModule = new Module({
  imports: [jsModule],
  providers: [Logger],
  routes: [appRouter],
});
