import "reflect-metadata";

export function Injectable() {
  return function (target: any) {
    Reflect.defineMetadata("injectable", true, target);
  };
}

export const INJECT_TOKEN_METADATA_KEY = "custom:inject_token";

export type InjectTokenMetadata = {
  token: string;
  parameterIndex: number;
};

export function Inject(token: string) {
  return function (
    target: any,
    propertyKey: undefined,
    parameterIndex: number
  ) {
    const existingMetadata: InjectTokenMetadata[] =
      Reflect.getMetadata(INJECT_TOKEN_METADATA_KEY, target) || [];
    existingMetadata.push({ token, parameterIndex });
    Reflect.defineMetadata(INJECT_TOKEN_METADATA_KEY, existingMetadata, target);
  };
}
