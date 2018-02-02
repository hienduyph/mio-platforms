import { interfaces } from "inversify";

import { InjectToken } from "./inject_token";
import { getInjectableMetadata } from "./injectable";
import { NewAble } from "./newable";

export interface AbstractInterface<T> {
  target: NewAble<T>;
  implementation?: NewAble<T>;
  useAbstract?: NewAble<T>;
  useConstant?: T;
}

export type ClassInterface = { new(...args: any[]): any; };

export interface ConstantInterface {
  target: InjectToken;
  class?: any;
  constant?: any;
  exist?: InjectToken;
}

export type RegisterInterface<T> = AbstractInterface<T> | ClassInterface | ConstantInterface;

export type InjectIdentifier<T> = InjectToken | ClassInterface | interfaces.ServiceIdentifier<T>;

/**
 * Check an provide is a valid abstract-implementation pair class
 * @param data register data
 */
export function isConstantInterface(data: RegisterInterface<any>): data is ConstantInterface {
  if (data && (data as ConstantInterface).target) {
    const token = (data as ConstantInterface).target;
    if (token instanceof InjectToken) {
      return true;
    }
  }
  return false;
}

/**
 * Check an provide is a valid abstract-implementation pair class
 * @param data register data
 */
export function isAbstractInterface(data: RegisterInterface<any>): data is AbstractInterface<any> {
  if (data && (data as AbstractInterface<any>).target) {
    const abstractTarget = (data as AbstractInterface<any>).target;
    const token = getInjectableMetadata(abstractTarget);
    if (token instanceof InjectToken) {
      return true;
    }
  }
  return false;
}


/**
 * Check an provide is a valid abstract-implementation pair class
 * @param data register data
 */
export function isClassInterface(
  data: RegisterInterface<any> | InjectIdentifier<any>,
): data is ClassInterface {
  if (canNew(data)) {
    const token = getInjectableMetadata(data);
    if (token instanceof InjectToken) {
      return true;
    }
  }
  return false;
}

function canNew(target: any): target is NewAble<any> {
  return typeof(target) === "function" || typeof(target) === "object";
}
