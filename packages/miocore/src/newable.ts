export interface Class<T> extends Function {
  new (...args: any[]): T;
}

/**
 * NewAble type represent a class or constructor function can call new
 */
export type NewAble<T> = Class<T> | Function | any;
