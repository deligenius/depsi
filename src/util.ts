import "reflect-metadata";
import { Metadata } from "./decorators.js";
import { type Constructor } from "./container.js";

export function getClsKey(cls: Constructor<any> | string): symbol | string {
  if (typeof cls === "string" || typeof cls === "symbol") {
    return cls;
  } else if (cls.hasOwnProperty(Metadata.INJECTABLE_METADATA_KEY)) {
    // for vanilla JS classes only
    return cls.prototype[Metadata.INJECTABLE_METADATA_KEY];
  } else {
    const injectableSymbol: symbol | undefined = Reflect.getMetadata(
      Metadata.INJECTABLE_METADATA_KEY,
      cls
    );

    /**
     * if no injectable symbol, use the class name as the key
     * this is useful for vanilla JS classes that are not decorated with `@Injectable`
     */
    if (!injectableSymbol) {
      throw new Error(`No injectable symbol found for ${cls.name}`);
    } else {
      return injectableSymbol;
    }
  }
}
