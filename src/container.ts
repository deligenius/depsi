import "reflect-metadata";
import { getParamsFromJsDoc } from "./util.js";

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

    if (this._instances.has(cls.name)) {
      return this.resolve(cls);
    }

    let paramTypes: (string | C)[] =
      Reflect.getMetadata("design:paramtypes", cls) || [];

    if (paramTypes.length > 0 && (paramTypes[0] as C).name === "Object") {
      // it's a javascript class, try to get the types from JSDoc
      paramTypes = getParamsFromJsDoc(cls);
    }

    const dependencies = paramTypes.map((dep: Constructor<T> | string) =>
      this.resolve(dep)
    );
    return this.register(cls, () => new cls(...dependencies));
  }
}

export function Depends<T>(cls: Constructor<T> | string) {
  return Container.resolve(cls);
}
