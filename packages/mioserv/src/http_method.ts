import { InjectToken, NewAble } from "miocore";

import { Middleware } from "./middleware";

/**
 * DI Token for method endpoint handler
 */
export const METHOD_INJECT_TOKEN = new InjectToken("ExpressMethodToken");

/**
 * Register current method to handle all request
 * @param path The relative path of the endpoint, the prefix path of the controller will be added.
 * @param middleware List of middleware, optional
 */
export function All(path: string, ...middleware: Middleware[]): MethodDecorator {
  return Method("all", path, ...middleware);
}

/**
 * Register current method to handle get request
 * @param path The relative path of the endpoint, the prefix path of the controller will be added.
 * @param middleware List of middleware, optional
 */
export function Get(path: string, ...middleware: Middleware[]): MethodDecorator {
  return Method("get", path, ...middleware);
}

/**
 * Register current method to handle post request
 * @param path The relative path of the endpoint, the prefix path of the controller will be added.
 * @param middleware List of middleware, optional
 */
export function Post(path: string, ...middleware: Middleware[]): MethodDecorator {
  return Method("post", path, ...middleware);
}

/**
 * Register current method to handle put request
 * @param path The relative path of the endpoint, the prefix path of the controller will be added.
 * @param middleware List of middleware, optional
 */
export function Put(path: string, ...middleware: Middleware[]): MethodDecorator {
  return Method("put", path, ...middleware);
}

/**
 * Register current method to handle patch request
 * @param path The relative path of the endpoint, the prefix path of the controller will be added.
 * @param middleware List of middleware, optional
 */
export function Patch(path: string, ...middleware: Middleware[]): MethodDecorator {
  return Method("patch", path, ...middleware);
}

/**
 * Register current method to handle head request
 * @param path The relative path of the endpoint, the prefix path of the controller will be added.
 * @param middleware List of middleware, optional
 */
export function Head(path: string, ...middleware: Middleware[]): MethodDecorator {
  return Method("head", path, ...middleware);
}

/**
 * Register current method to handle detele request
 * @param path The relative path of the endpoint, the prefix path of the controller will be added.
 * @param middleware List of middleware, optional
 */
export function Delete(path: string, ...middleware: Middleware[]): MethodDecorator {
  return Method("delete", path, ...middleware);
}

/**
 * Base decorator to register a method as an endpoint handler
 * @param method Name of the method: put, post, get, delete ...
 * @param path The relative path of the endpoint, the prefix path of the controller will be added.
 * @param middleware List of middleware, optional
 */
export function Method<T>(method: string, path: string, ...middleware: Middleware[]) {
  return function (target: NewAble<T>, key: string | symbol, _: any) {
    const metadata: MethodMetadata<T> = { key, method, middleware, path, target };

    // add all metadata of handler to the constructor
    let metadataList: MethodMetadata<T>[] = [];
    if (!Reflect.hasOwnMetadata(METHOD_INJECT_TOKEN, target.constructor)) {
      Reflect.defineMetadata(METHOD_INJECT_TOKEN, metadataList, target.constructor);
    } else {
      metadataList = Reflect.getOwnMetadata(METHOD_INJECT_TOKEN, target.constructor);
    }
    metadataList.push(metadata);
  } as MethodDecorator;
}

export interface MethodMetadata<T> {
  method: string;
  key: string | symbol;
  path: string;
  middleware: Middleware[];
  target: NewAble<T>;
}

/**
 * Get metadata of the controller
 */
export const getControllerMethodMetadata = <T>(constructor: NewAble<T>) => Reflect.getOwnMetadata(
  METHOD_INJECT_TOKEN,
  constructor,
) as MethodMetadata<T>[];
