import { Injectable } from "depsi";
import { config } from "dotenv";

@Injectable()
export class ConfigService {
  constructor() {
    config();
  }
  get(key: string) {
    return process.env[key];
  }
}
