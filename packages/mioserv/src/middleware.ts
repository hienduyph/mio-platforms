import { decorate } from "inversify";
import { RequestHandler, ErrorRequestHandler } from "express";
import { InjectToken, Injectable, NewAble } from "miocore";

const MIDDLEWARE_INJECT_TOKEN = new InjectToken("Middleware");

export type Middleware = NewAble<MiddlewareCore>;

/**
 * The middleware decorator
 */
export function Middleware() {
  return function (target: Middleware) {
    // each middlware will be create an instance bounded with it's name
    const name = Symbol(target.name);
    decorate(Injectable() as ClassDecorator, target);
    Reflect.defineMetadata(MIDDLEWARE_INJECT_TOKEN, name, target);
    return target;
  };
}

export const getMiddlewareMetadata = (constructor: Middleware) => Reflect.getOwnMetadata(
  MIDDLEWARE_INJECT_TOKEN,
  constructor,
) as symbol;

/**
 * The main interface for expressjs
 */
export interface MiddlewareCore {
  /**
   * Handle the http request
   */
  handle: RequestHandler | ErrorRequestHandler;
}

