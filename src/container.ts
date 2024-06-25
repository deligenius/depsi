import "reflect-metadata";
import { InjectTokenMetadata } from "./decorators.js";
import { getClsKey } from "./util.js";
import { INJECT_TOKEN_METADATA_KEY } from "./enums.js";
import { type Constructor } from "./types.js";

export class Container {
  static _instances: Map<symbol | string, any> = new Map();

  static async register<T>(
    cls: Constructor<T> | string,
    callback: () => T | Promise<T>
  ) {
    const key = getClsKey(cls);
    const instance = await callback();
    this._instances.set(key, instance);
    return instance;
  }

  static resolve<T>(cls: Constructor<T> | string | symbol): T {
    const key = getClsKey(cls);
    const instance = this._instances.get(key);
    if (!instance) {
      const className =
        typeof cls === "string"
          ? cls
          : typeof cls === "symbol"
          ? cls.toString()
          : cls.name;
      throw new Error(`Instance not found for ${className}`);
    }
    return instance;
  }

  static auto_register<T>(cls: Constructor<T>) {
    type ClassParameter = symbol | string;

    const key = getClsKey(cls);

    if (this._instances.has(key)) {
      return this._instances.get(key);
    }

    let params: ClassParameter[] | undefined = Reflect.getMetadata(
      "design:paramtypes",
      cls
    );

    // if no constructor or parameters, just create the instance
    if (!params?.length) {
      return this.register(cls, () => new cls());
    }

    const paramsWithToken = this._handleInjectDecorator(cls, params);

    const dependencies = paramsWithToken.map((dep) => this.resolve(dep));
    return this.register(cls, () => new cls(...dependencies));
  }

  /** Handle dynamic module's `@Inject`, replace class with token
   *  so that the `@Inject` class can be resolved from the container
   */
  private static _handleInjectDecorator<T>(
    cls: Constructor<T>,
    paramTypes: (string | symbol)[]
  ) {
    // get the inject metadata (from dynamic modules)
    const injectMetadata: InjectTokenMetadata[] | undefined =
      Reflect.getMetadata(INJECT_TOKEN_METADATA_KEY, cls.prototype.constructor);

    // if there are inject metadata, replace the token with the actual class
    if (injectMetadata?.length) {
      const newParamTypes = [...paramTypes];
      injectMetadata.forEach((metadata) => {
        newParamTypes[metadata.parameterIndex] = metadata.token;
      });
      return newParamTypes;
    } else {
      return paramTypes;
    }
  }
}

export function Depends<T>(cls: Constructor<T> | string) {
  return Container.resolve(cls);
}
