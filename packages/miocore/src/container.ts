import { Container as InversifyContainer } from "inversify";

import { InjectToken } from "./inject_token";
import { getInjectableMetadata } from "./injectable";
import {
  RegisterInterface,
  isAbstractInterface,
  isConstantInterface,
  isClassInterface,
  InjectIdentifier
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
    } else if (isClassInterface(data)) {
      // class case
      const token = getInjectableMetadata(data).uuid();
      this.bind<T>(token).to(data);
    } else if (isAbstractInterface(data)) {
      // get inject token from target abstract class
      const token = getInjectableMetadata(data.target).uuid();
      this.bind<T>(token).to(data.implementation);
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
}
