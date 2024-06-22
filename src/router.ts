import { Router as _Router, RouterOptions } from "express";

export interface Router extends _Router {
  prefix: string;
}

export function createRouter(prefix: string, options?: RouterOptions) {
  const router = _Router(options) as Router;
  router.prefix = prefix;

  return router;
}
