/**
 * Get list of params types for each params we pass to constructor
 * @param constructor prototype of class constructor
 */
export const getConstructorParamTypes = (constructor: any): any[] => {
  return Reflect.getMetadata("design:paramtypes", constructor) || [];
};
