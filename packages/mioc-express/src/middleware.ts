import { decorate } from "inversify";
import { Request, Response, NextFunction } from "express";
import { InjectToken, Injectable } from "mioc-core";

const MIDDLEWARE_INJECT_TOKEN = new InjectToken("Middleware");

/**
 * The middleware decorator
 */
export function Middleware() {
  return function(target: any) {
    // each middlware will be create an instance bounded with it's name
    const name = Symbol("target.name");
    decorate(Injectable(), target);
    Reflect.defineMetadata(MIDDLEWARE_INJECT_TOKEN, name, target);
    return target;
  };
}

export const getMiddlewareMetadata = (constructor: any) => Reflect.getOwnMetadata(
  MIDDLEWARE_INJECT_TOKEN,
  constructor
) as symbol;

/**
 * The main interface for expressjs
 */
export interface MiddlewareCore {
  /**
   * Handle the http request
   */
  handle: (req: Request, resp: Response, next: NextFunction) => any;
}

export type Middleware = new(...args: any[]) => MiddlewareCore;
