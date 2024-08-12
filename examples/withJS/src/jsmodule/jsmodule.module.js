import { Module } from "depsi";
import { LoggerJs } from "./jsmodule.service.js";
import { jsRouter } from "./jsmodule.router.js";

export const jsModule = new Module({
  providers: [LoggerJs],
  imports: [],
  routes: [jsRouter],
});
