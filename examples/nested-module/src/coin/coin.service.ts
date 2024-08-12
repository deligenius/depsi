import { Injectable } from "depsi";

@Injectable()
export class CoinService {
  constructor() {
    console.log("coin service created");
  }

  getCoin(name: string) {
    return "this is the coin: " + name;
  }
}
