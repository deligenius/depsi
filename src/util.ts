import "reflect-metadata";

import { INJECTABLE_METADATA_KEY } from "./enums";
import { type Constructor } from "./types";

export function getClsKey(
  cls: Constructor<any> | string | symbol
): symbol | string {
  if (typeof cls === "string" || typeof cls === "symbol") {
    return cls;
  } else {
    const injectableSymbol: symbol | undefined = Reflect.getMetadata(
      INJECTABLE_METADATA_KEY,
      cls
    );

    /**
     * if no injectable symbol, use the class name as the key
     * this is useful for vanilla JS classes that are not decorated with `@Injectable`
     */
    if (!injectableSymbol) {
      return cls.name;
    } else {
      return injectableSymbol;
    }
  }
}
