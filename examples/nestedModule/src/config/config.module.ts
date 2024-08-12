import { Module } from "depsi";
import { ConfigService } from "./config.service.js";

export const configModule = new Module({
  imports: [],
  providers: [ConfigService],
});
