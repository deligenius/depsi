import "reflect-metadata";
import { Constructor, Token } from "./type.js";

export const Metadata = {
  INJECT_TOKEN_METADATA_KEY: Symbol.for("custom:inject_token"),
  INJECTABLE_METADATA_KEY: Symbol.for("custom:injectable"),
};

export type InjectableMetadata = {
  injectable: boolean;
};

// region @Injectable
export function Injectable(jsClass?: Constructor<any>) {
  if (jsClass) {
    jsClass.prototype[Metadata.INJECTABLE_METADATA_KEY] = {
      injectable: true,
    };
  }
  return function (target: any) {
    Reflect.defineMetadata(
      Metadata.INJECTABLE_METADATA_KEY,
      {
        injectable: true,
      } satisfies InjectableMetadata,
      target
    );
  };
}

//region @Inject, for Javascript
export type InjectTokenMetadata = {
  token: Exclude<Token, FunctionType<any>>;
  parameterIndex: number;
};

export function Inject(token: Exclude<Token, FunctionType<any>>) {
  return function (
    target: any,
    propertyKey: undefined,
    parameterIndex: number
  ) {
    const existingMetadata: InjectTokenMetadata[] =
      Reflect.getMetadata(Metadata.INJECT_TOKEN_METADATA_KEY, target) || [];
    // we will have to replace the token with an instance
    existingMetadata.push({ token, parameterIndex });
    Reflect.defineMetadata(
      Metadata.INJECT_TOKEN_METADATA_KEY,
      existingMetadata,
      target
    );
  };
}
