import "reflect-metadata";
import { Constructor, ModuleProvider, Provider, Token } from "./type.js";
import {
  InjectableMetadata,
  InjectTokenMetadata,
  Metadata,
} from "./decorators.js";

function isConstructor(cls: any): cls is Constructor<any> {
  return typeof cls === "function";
}

export class Container {
  private _instanceMap: Map<Token, any>;

  private static globalMap = new Map<Token, any>();

  constructor() {
    this._instanceMap = new Map();
  }

  public async registerProvider<T>({
    token,
    useValue,
    isGlobal = false,
  }: Provider<T>) {
    //region avoid duplicate registration
    if (Container.globalMap.has(token)) {
      return Container.globalMap.get(token);
    }

    if (this._instanceMap.has(token)) {
      return this._instanceMap.get(token);
    }

    //region register provider

    const value = typeof useValue === "function" ? await useValue() : useValue;
    if (isGlobal) {
      Container.globalMap.set(token, value);
    } else {
      this._instanceMap.set(token, value);
    }
    return value;
  }

  public resolveToken<T>(token: Token<T>): T {
    if (Container.globalMap.has(token)) {
      return Container.globalMap.get(token);
    }

    if (!this._instanceMap.has(token)) {
      const className = typeof token === "string" ? token : token.name;
      throw new Error(`Instance not found for ${className}`);
    }
    return this._instanceMap.get(token);
  }

  public mergeContainer(container: Container) {
    this._instanceMap = new Map([
      ...this._instanceMap,
      ...container._instanceMap,
    ]);
    return this._instanceMap;
  }

  public auto_register<T>(provider: ModuleProvider<T>) {
    const token = isConstructor(provider) ? provider : provider.token;

    if (this._instanceMap.has(token)) {
      return this._instanceMap.get(token);
    }
    // region string token
    //? string token, it's a custom provider, {token: 'custom', useValue: 'customValue'}
    if (typeof token === "string") {
      if ("useValue" in provider) {
        return this.registerProvider({ token, useValue: provider.useValue });
      }
      throw new Error(
        `Cannot resolve token: [${token}], please provide a useValue`
      );
    }
    // endregion string token

    //region class token
    // determin if the class token is @Injectable()
    if (!this._isInjectable(token)) {
      throw new Error(`Class [${token.name}] is not injectable`);
    }

    let params: Token[] | undefined = Reflect.getMetadata(
      "design:paramtypes",
      token
    );

    // No parameters, just create the instance with class constructor
    if (!params?.length) {
      // {token: Class, useValue: new Class()}
      return this.registerProvider({
        token,
        useValue: new token(),
      });
    }
    // replace @Inject() with the actual instance
    const paramsWithInstance = this._handleInjectDecorator(token, params);

    const dependencies = paramsWithInstance.map((dependency) =>
      this.resolveToken(dependency)
    );
    return this.registerProvider({
      token,
      useValue: new token(...dependencies),
    });
    // endregion class token
  }

  private _isInjectable(token: Constructor<any>) {
    // JS class
    const isJsClass = token.prototype.hasOwnProperty(
      Metadata.INJECTABLE_METADATA_KEY
    );

    if (isJsClass) {
      const metadata: InjectableMetadata =
        token.prototype[Metadata.INJECTABLE_METADATA_KEY];
      return metadata.injectable;
    }
    // TS class
    else if (Reflect.getMetadata(Metadata.INJECTABLE_METADATA_KEY, token)) {
      const metadata: InjectableMetadata = Reflect.getMetadata(
        Metadata.INJECTABLE_METADATA_KEY,
        token
      );
      return metadata.injectable;
    } else {
      return false;
    }
  }

  /** Handle dynamic module's `@Inject`, replace class with token
   *  so that the `@Inject` class can be resolved from the container
   */
  private _handleInjectDecorator<T>(
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
