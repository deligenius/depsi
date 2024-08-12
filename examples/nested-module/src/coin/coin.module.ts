import { Module } from "depsi";
import { dogeRouter } from "./doge/doge.router.js";
import { coinRouter } from "./coin.router.js";
import { CoinService } from "./coin.service.js";

export const coinModule = new Module({
  imports: [],
  providers: [CoinService],
  routes: [coinRouter, dogeRouter],
});
