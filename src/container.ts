import "reflect-metadata";
import { getParamsFromJsDoc } from "./util.js";
import {
  INJECT_TOKEN_METADATA_KEY,
  InjectTokenMetadata,
} from "./decorators.js";

export type Constructor<T> = new (...args: any[]) => T;

export class Container {
  static _instances: Map<string, any> = new Map();

  static async register<T>(
    cls: Constructor<T> | string,
    callback: () => T | Promise<T>
  ) {
    const className = typeof cls === "string" ? cls : cls.name;
    const instance = await callback();
    this._instances.set(className, instance);
    return instance;
  }

  static resolve<T>(cls: Constructor<T> | string): T {
    const className = typeof cls === "string" ? cls : cls.name;
    const instance = this._instances.get(className);
    if (!instance) {
      throw new Error(`Instance not found for ${className}`);
    }
    return instance;
  }

  static auto_register<T>(cls: Constructor<T>) {
    type C = Constructor<T>;
    type ClassParameter = C | string;

    if (this._instances.has(cls.name)) {
      return this.resolve(cls);
    }

    let params: ClassParameter[] | undefined = Reflect.getMetadata(
      "design:paramtypes",
      cls
    );

    // if no constructor or parameters, just create the instance
    if (!params?.length) {
      return this.register(cls, () => new cls());
    }

    const paramsWithToken = this.replaceClassWithToken(cls, params);

    const dependencies = paramsWithToken.map((dep: ClassParameter) =>
      this.resolve(dep)
    );
    return this.register(cls, () => new cls(...dependencies));
  }

  /** Handle dynamic module's `@Inject`, replace class with token
   *  so that the `@Inject` class can be resolved from the container
   */
  private static replaceClassWithToken<T>(
    cls: Constructor<T>,
    paramTypes: (string | Constructor<T>)[]
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
