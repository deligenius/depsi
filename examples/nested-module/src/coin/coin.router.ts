import { createRouter } from "depsi";
import { ConfigService } from "../config/config.service.js";
import { coinModule } from "./coin.module.js";

export const coinRouter = createRouter("/coin");

coinRouter.get("/market", (req, res) => {
  res.send("this is the market of the coin");
});


coinRouter.get('/env', (req, res) => {
  const configService = coinModule.resolve(ConfigService);

  res.send(configService.get("MY_KEY"));
})