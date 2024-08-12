//app.service.ts
import { Injectable } from "depsi";

@Injectable()
export class Logger {
  log(message: string) {
    console.log(message);
  }
}
