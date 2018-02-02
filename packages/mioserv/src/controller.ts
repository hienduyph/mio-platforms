import { decorate } from "inversify";

import { InjectToken, Injectable, NewAble } from "miocore";
import { Middleware } from "./middleware";

/**
 * Key metadata for express controller
 */
export const CONTROLLER_INJECT_TOKEN = new InjectToken("ExpressController");

export interface ControllerMetadata {
  prefix: string;
  middlewares: Middleware[];
  target: any;
}

/**
 * Register a class as a controller
 * @param path prefix path of this controller
 * @param middleware list of middlewares
 */
export function Controller<T>(
  metadata: {
    prefix: string,
    middlewares?: Middleware[],
  },
) {
  return function (target: NewAble<T>) {
    const { prefix, middlewares } = metadata;
    const currentMetadata: ControllerMetadata = {
      prefix,
      target,
      middlewares: middlewares || [],
    };
    // we decorate injetable for your
    decorate(Injectable() as ClassDecorator, target);
    // attach the metadata key to the current controller target
    Reflect.defineMetadata(CONTROLLER_INJECT_TOKEN, currentMetadata, target);
    return target;
  };
}

/**
 * Get metadata of the controller
 */
export const getControllerMetadata = <T> (constructor: NewAble<T>) => Reflect.getOwnMetadata(
    CONTROLLER_INJECT_TOKEN,
    constructor,
) as ControllerMetadata;
