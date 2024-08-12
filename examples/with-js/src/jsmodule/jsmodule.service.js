import { Inject, Injectable } from "depsi";

@Injectable()
export class LoggerJs {
  constructor() {
    console.log("LogerJs");
  }

  /**
   * @param {string} message
   */
  log(message) {
    console.log(message);
  }
}

@Injectable()
export class JsmoduleService {
  /**
   * @param {LoggerJs} logger
   */
  constructor(@Inject(LoggerJs) logger) {
    this.logger = logger;
  }

  start() {
    this.logger.log("JsmoduleService started");
  }
}
