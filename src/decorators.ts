import "reflect-metadata";
import { type Constructor } from "./container.js";
import { Handler, Router } from "express";

export enum Metadata {
  INJECT_TOKEN_METADATA_KEY = "custom:inject_token",
  INJECTABLE_METADATA_KEY = "custom:injectable",
}

export const defileInjectable = (target: any) => {
  Reflect.defineMetadata(
    Metadata.INJECTABLE_METADATA_KEY,
    Symbol.for(target.name),
    target
  );
};

export function Injectable(jsClass?: Constructor<any>) {
  // for vanilla JS classes only
  if (jsClass) {
    jsClass.prototype[Metadata.INJECTABLE_METADATA_KEY] = Symbol.for(
      jsClass.name
    );
  }
  return function (target: any) {
    Reflect.defineMetadata(
      Metadata.INJECTABLE_METADATA_KEY,
      Symbol.for(target.name),
      target
    );
  };
}

export type InjectTokenMetadata = {
  token: string | Constructor<any>;
  parameterIndex: number;
};

export function Inject(token: Constructor<any> | string) {
  return function (
    target: any,
    propertyKey: undefined,
    parameterIndex: number
  ) {
    const existingMetadata: InjectTokenMetadata[] =
      Reflect.getMetadata(Metadata.INJECT_TOKEN_METADATA_KEY, target) || [];
    existingMetadata.push({ token, parameterIndex });
    Reflect.defineMetadata(
      Metadata.INJECT_TOKEN_METADATA_KEY,
      existingMetadata,
      target
    );
  };
}

const ROUTER_KEY = "custom:router";
const ROUTER_HANDLER_KEY = "custom:router_handler";
type ControllerMetadata = {
  prefix: string;
  router: Router;
};

type RouteMetadata = {
  prefix: string;
  method: "get" | "post" | "put" | "delete";
  handler: Handler;
};

export function Controller(route: string) {
  return function (target: any) {
    const router = Router();

    const routeMetadatas: RouteMetadata[] = Reflect.getMetadata(
      ROUTER_HANDLER_KEY,
      target
    );

    routeMetadatas.forEach(({ prefix, handler, method }) => {
      router[method](prefix, handler);
    });

    Reflect.defineMetadata(
      ROUTER_KEY,
      {
        prefix: route,
        router,
      } satisfies ControllerMetadata,
      target
    );
  };
}
