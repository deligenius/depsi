import { Module } from "depsi";
import { JsmoduleService, LoggerJs } from "./jsmodule.service.js";
import { jsRouter } from "./jsmodule.router.js";

export const jsModule = new Module({
  providers: [LoggerJs, JsmoduleService],
  imports: [],
  routes: [jsRouter],
});
