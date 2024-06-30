import "reflect-metadata";
import express, {
  Handler,
  NextFunction,
  Router,
  type Request,
  type Response,
} from "express";

const ROUTER_KEY = "custom:router";
const ROUTER_HANDLER_KEY = "custom:router_handler";
type ControllerMetadata = {
  prefix: string;
  router: Router;
};

export function Controller(route: string) {
  return function (target: any, other: any) {
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

type RouteMetadata = {
  prefix: string;
  method: "get" | "post" | "put" | "delete";
  handler: Handler;
};

export function Get(route: string = "/") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const originalMethod = descriptor.value;

    const parameterMetadatas: ParameterMetadata[] = Reflect.getMetadata(
      METHOD_PARAMETER,
      target,
      propertyKey
    );

    //! method gets called here
    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      const params = await Promise.all(
        parameterMetadatas.map((metadata) =>
          metadata.paramHandler(req, res, next)
        )
      );

      const result = await originalMethod.apply(null, params);
      // ! return value from the method
      if (result) {
        if (typeof result === "string") {
          res.send(result);
        } else {
          res.json(result);
        }
      } else {
        res.end();
      }
    };

    const routeMetadata: RouteMetadata = {
      prefix: route,
      method: "get",
      handler: descriptor.value,
    };

    const metadata: RouteMetadata[] | undefined = Reflect.getMetadata(
      ROUTER_HANDLER_KEY,
      target.constructor
    );

    const newMetadata = metadata
      ? [...metadata, routeMetadata]
      : [routeMetadata];

    Reflect.defineMetadata(ROUTER_HANDLER_KEY, newMetadata, target.constructor);
  };
}
const METHOD_PARAMETER = "custom:method_parameter";

type ParameterMetadata = {
  methodName: string;
  parameterIndex: number;
  paramHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<any> | any;
};

export function Req(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  const requestMetadata: ParameterMetadata = {
    methodName: propertyKey.toString(),
    parameterIndex,
    paramHandler: (req: Request, res: Response, next: NextFunction) => req,
  };

  let parameterMetadatas: ParameterMetadata[] =
    Reflect.getOwnMetadata(METHOD_PARAMETER, target, propertyKey) || [];

  parameterMetadatas.push(requestMetadata);

  Reflect.defineMetadata(
    METHOD_PARAMETER,
    parameterMetadatas,
    target,
    propertyKey
  );
}

export function Res(
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) {
  const requestMetadata: ParameterMetadata = {
    methodName: propertyKey.toString(),
    parameterIndex,
    paramHandler: (req: Request, res: Response, next: NextFunction) => {
      return res;
    },
  };

  let parameterMetadatas: ParameterMetadata[] =
    Reflect.getOwnMetadata(METHOD_PARAMETER, target, propertyKey) || [];

  parameterMetadatas.push(requestMetadata);

  Reflect.defineMetadata(
    METHOD_PARAMETER,
    parameterMetadatas,
    target,
    propertyKey
  );
}
