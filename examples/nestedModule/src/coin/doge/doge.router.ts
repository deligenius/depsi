import { createRouter } from "depsi";
import { coinModule } from "../coin.module.js";
import { CoinService } from "../coin.service.js";

export const dogeRouter = createRouter("/coin/doge");

dogeRouter.get("/hi", (req, res) => {
  const coinService = coinModule.resolve(CoinService);
  const message = coinService.getCoin("doge");
  res.send(message);
});
