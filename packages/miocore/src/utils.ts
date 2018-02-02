import { NewAble } from "./newable";

/**
 * Get list of params types for each params we pass to constructor
 * @param constructor prototype of class constructor
 */
export const getConstructorParamTypes = <T> (constructor: NewAble<T>): NewAble<T>[] => {
  return Reflect.getMetadata("design:paramtypes", constructor) || [];
};
