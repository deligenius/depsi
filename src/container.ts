import "reflect-metadata";
import { InjectTokenMetadata, Metadata } from "./decorators.js";
import { getClsKey } from "./util.js";

export type Constructor<T> = new (...args: any[]) => T;

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

  static resolve<T>(cls: Constructor<T> | string): T {
    const key = getClsKey(cls);
    const instance = this._instances.get(key);
    if (!instance) {
      const className = typeof cls === "string" ? cls : cls.name;
      throw new Error(`Instance not found for ${className}`);
    }
    return instance;
  }

  static auto_register<T>(cls: Constructor<T>) {
    type ClassParameter = Constructor<T> | string;

    const key = getClsKey(cls);

    if (this._instances.has(key)) {
      return this._instances.get(key);
    }

    let params: ClassParameter[] | undefined = Reflect.getMetadata(
      "design:paramtypes",
      cls
    );

    // dif no constructor or parameters, just create the instance
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
    paramTypes: (string | Constructor<any>)[]
  ) {
    // get the inject metadata (from dynamic modules)
    const injectMetadata: InjectTokenMetadata[] | undefined =
      Reflect.getMetadata(
        Metadata.INJECT_TOKEN_METADATA_KEY,
        cls.prototype.constructor
      );

    // if no inject metadata, return the original paramTypes
    if (!injectMetadata?.length) {
      return paramTypes;
    }

    // if there are inject metadata, replace the "Object" with the token (dynamic module token)
    const newParams = injectMetadata.reduce((acc, metadata) => {
      acc[metadata.parameterIndex] = metadata.token;
      return acc;
    }, paramTypes);

    return newParams;
  }
}

export function Depends<T>(cls: Constructor<T> | string) {
  return Container.resolve(cls);
}
