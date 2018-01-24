import { injectable, decorate, inject } from "inversify";

import { InjectToken } from "./inject_token";
import { getConstructorParamTypes } from "./utils";

export const INJECTABLE_META_KEY = new InjectToken("Injectable");

/**
 * Get metadata of @Injectable() decorator
 * @param target prototype or class constructor
 */
export const getInjectableMetadata = (target: any) =>
  Reflect.getMetadata(INJECTABLE_META_KEY, target) as InjectToken;

/**
 * Wrapper a class or abstract di
 * @param target class target
 */
export function Injectable() {
  return function(target: any) {
    // get type of each params
    const paramsTypes = getConstructorParamTypes(target);
    // get injectable metadata key for each params
    const metadataKeys: InjectToken[] = paramsTypes.map((constructor: any) => {
      return getInjectableMetadata(constructor);
    });

    // create a unique token for each class constructor
    const token = new InjectToken(`${target.name}`);

    Reflect.defineMetadata(INJECTABLE_META_KEY, token, target);
    // decorate the native inversify injectable for class
    decorate(injectable(), target);
    // decorate @inject for each param if key is exists
    metadataKeys.forEach((key, index) => {
      if (key) {
        inject(key.uuid())(target, undefined as any, index);
      }
    });
    return target;
  };
}
