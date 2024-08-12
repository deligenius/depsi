import { Injectable } from "depsi";

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
