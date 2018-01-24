import { decorate } from "inversify";

import { InjectToken, Injectable } from "mioc-core";
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
export function Controller(
  metadata: {
    prefix: string,
    middlewares?: Middleware[]
  }
) {
  return function (target: any) {
    const { prefix, middlewares } = metadata;
    let currentMetadata: ControllerMetadata = {
      middlewares: middlewares || [],
      prefix,
      target
    };
    // we decorate injetable for your
    decorate(Injectable(), target);
    // attach the metadata key to the current controller target
    Reflect.defineMetadata(CONTROLLER_INJECT_TOKEN, currentMetadata, target);
    return target;
  };
}

/**
 * Get metadata of the controller
 */
export const getControllerMetadata = (constructor: any) => Reflect.getOwnMetadata(
    CONTROLLER_INJECT_TOKEN,
    constructor
) as ControllerMetadata;
