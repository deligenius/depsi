//app.module.ts
import { appRouter } from "./app.router.js"; // or "./app.router" if you are using CommonJS
import { Module } from "depsi";
import { Logger } from "./app.service.js"; // or "./app.service" if you are using CommonJS
import { configModule } from "./config/config.module.js";
import { coinModule } from "./coin/coin.module.js";

export const appModule = new Module({
  imports: [configModule, coinModule],
  providers: [Logger],
  routes: [appRouter],
});
