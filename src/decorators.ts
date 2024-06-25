import "reflect-metadata";
import { getClsKey } from "./util";
import { INJECTABLE_METADATA_KEY, INJECT_TOKEN_METADATA_KEY } from "./enums";
import { type Constructor } from "./types";

export function Injectable() {
  return function (target: any) {
    Reflect.defineMetadata(
      INJECTABLE_METADATA_KEY,
      Symbol.for(target.name),
      target
    );
  };
}

export type InjectTokenMetadata = {
  token: string | symbol;
  parameterIndex: number;
};

export function Inject(token: Constructor<any> | string) {
  return function (
    target: any,
    propertyKey: undefined,
    parameterIndex: number
  ) {
    const key = getClsKey(token);

    const existingMetadata: InjectTokenMetadata[] =
      Reflect.getMetadata(INJECT_TOKEN_METADATA_KEY, target) || [];
    existingMetadata.push({ token: key, parameterIndex });
    Reflect.defineMetadata(INJECT_TOKEN_METADATA_KEY, existingMetadata, target);
  };
}
