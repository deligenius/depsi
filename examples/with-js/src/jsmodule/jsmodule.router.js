import { createRouter } from "depsi";
import { jsModule } from "./jsmodule.module.js";
import { JsmoduleService, LoggerJs } from "./jsmodule.service.js";

export const jsRouter = createRouter("/js");

jsRouter.get("/start", (req, res) => {
  const jsService = jsModule.resolve(JsmoduleService);
  jsService.start();
  res.send("JsmoduleService started");
});

jsRouter.get("/log", (req, res) => {
  const jsLogger = jsModule.resolve(LoggerJs);
  jsLogger.log("LogerJs from /js/log");
  res.send("LogerJs say hi");
});
