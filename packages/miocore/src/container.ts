import { Container as InversifyContainer } from "inversify";

import { InjectToken } from "./inject_token";
import { getInjectableMetadata } from "./injectable";
import {
  RegisterInterface,
  isAbstractInterface,
  isConstantInterface,
  isClassInterface,
  InjectIdentifier,
  AbstractInterface,
  ConstantInterface,
} from "./register_payload";

/**
 * Wrap the inversify container and provide extract methods for inject
 * our custom token
 */
export class Container extends InversifyContainer {
  /**
   * Register an abstract class - implementation pair
   */
  public register<T>(data: RegisterInterface<T>): this {
    // constant case
    if (isConstantInterface(data)) {
      return this.bindConstant(data);
    }
    if (isClassInterface(data)) {
      // class case
      const token = getInjectableMetadata<T>(data).uuid();
      this.bind<T>(token).to(data);
    } else if (isAbstractInterface(data)) {
      return this.bindAbstractClass(data);
    }
    return this;
  }

  /**
   * get the instance
   */
  public get<T>(identifier: InjectIdentifier<T>): T {
    // get instance by inject token
    if (identifier instanceof InjectToken) {
      return super.get<T>(identifier.uuid());
    }
    // get by class with @Injectable() decorated
    if (isClassInterface(identifier)) {
      return super.get<T>(getInjectableMetadata(identifier).uuid());
    }
    return super.get<T>(identifier);
  }
  
  /**
   * Bind abstract class
   */
  private bindAbstractClass<T>(data: AbstractInterface<T>) {
    // get inject token from target abstract class
    const token = getInjectableMetadata<T>(data.target).uuid();
    // use an implementation
    if (data.implementation) {
      this.bind<T>(token).to(data.implementation);
    } else if (data.useAbstract) {
      // get another abstract that has already bound
      const anotherToken = getInjectableMetadata<T>(data.useAbstract).uuid();
      const exist = this.get<T>(anotherToken);
      if (!exist) {
        throw new Error(`Invalid register payload, must bind the value for ${data.useAbstract}`);
      }
      this.bind<T>(token).toConstantValue(exist);
    } else if (data.useConstant) {
      this.bind<T>(token).toConstantValue(data.useConstant);
    } else {
      throw new Error(`Must have class for implemetation or abstract for useAbstract`);
    }
    return this;
  }

  /**
   * Bind constant value
   */
  private bindConstant<T>(data: ConstantInterface) {
    const token = data.target.uuid();
    if (data.class) {
      this.bind<T>(token).to(data.class);
    } else if (data.constant) {
      this.bind<T>(token).toConstantValue(data.constant);
    } else if (data.exist && data.exist instanceof InjectToken) {
      const exist = this.get<T>(data.exist.uuid());
      this.bind<T>(token).toConstantValue(exist);
    } else {
      throw new Error("Invalid register payload");
    }
    return this;
  }
}
