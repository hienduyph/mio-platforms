import { Router, Application, Request, Response, RequestHandler, NextFunction } from "express";
const express = require("express");

import { Container, getInjectableMetadata } from "miocore";
import { getControllerMetadata } from "./controller";
import { Middleware, MiddlewareCore, getMiddlewareMetadata } from "./middleware";
import { getControllerMethodMetadata } from "./http_method";
import { ConfigFunction, RoutingConfig } from "./config";

/**
 * Connect express server to inversify container
 */
export class MioServer {
  private router: Router;
  private container: Container;
  private app: Application;
  private configFn: ConfigFunction;
  private errorConfigFn: ConfigFunction;
  private routingConfig: RoutingConfig;

  // store the list of register controller
  private registeredControllers: any[] = [];

  /**
   * Wrapper for the express server.
   *
   * @param container Container loaded with all controllers and their dependencies.
   */
  constructor(
    container: Container,
    customRouter?: Router,
    routingConfig?: RoutingConfig,
    customApp?: Application,
  ) {
    this.container = container;
    this.router = customRouter || Router();
    this.routingConfig = routingConfig || {
      rootPath: "/",
    };
    this.app = customApp || express();
  }

  /**
   * Sets the configuration function to be applied to the application.
   * Note that the config function is not actually executed until a call to build().
   *
   * This method is chainable.
   *
   * @param fn Function in which app-level middleware can be registered.
   */
  public setConfig(fn: ConfigFunction): MioServer {
    this.configFn = fn;
    return this;
  }

  /**
   * Sets the error handler configuration function to be applied to the application.
   * Note that the error config function is not actually executed until a call to build().
   *
   * This method is chainable.
   *
   * @param fn Function in which app-level error handlers can be registered.
   */
  public setErrorConfig(fn: ConfigFunction): MioServer {
    this.errorConfigFn = fn;
    return this;
  }

  /**
   * Applies all routes and configuration to the server, returning the express application.
   */
  public build(): Application {
    // register server-level middleware before anything else
    if (this.configFn) {
      this.configFn.apply(undefined, [this.app]);
    }
    this.registerControllers();  

    // register error handlers after controllers
    if (this.errorConfigFn) {
      this.errorConfigFn.apply(undefined, [this.app]);
    }

    return this.app;
  }

  /**
   * Register the controllers list to the express app
   */
  public register(controllers: any[] = []) {
    // @todo: must resolve unique controller
    this.registeredControllers.push(...controllers);
  }

  private registerControllers() {
    if (this.registeredControllers.length < 1) {
      throw new Error("No controllers registered");
    }
    // loop though all controller constructors and create the controller instance
    const controllers = this.registeredControllers.map((constructor) => {
      const name = getInjectableMetadata(constructor).uuid();
      if (this.container.isBound(name)) {
        throw new Error(`Two controllers cannot have the same name: ${name}`);
      }
      // bind the controller instance to name
      this.container.register(constructor);
      return this.container.get(name);
    });

    controllers.forEach((controller: any) => {
      const controllerMetadata = getControllerMetadata(controller.constructor);
      const methodMetadata = getControllerMethodMetadata(controller.constructor);
      if (controllerMetadata && methodMetadata) {
        const controllerMiddleware = this.resolveMidleware(...controllerMetadata.middlewares);

        methodMetadata.forEach((metadata) => {
          // get the main handler of this method
          const handler: RequestHandler = controller[metadata.key].bind(controller);
          const routeMiddleware = this.resolveMidleware(...metadata.middleware);
          // assign the method with middlware
          (this.router as any)[metadata.method](
            `${controllerMetadata.prefix}${metadata.path}`,
            ...controllerMiddleware,
            ...routeMiddleware,
            handler,
          );
        });
      }
    });

    this.app.use(this.routingConfig.rootPath, this.router);
  }

  /**
   * Resolve list of middleware, create or get exist middleware instance
   * @param middleware list of middleware
   */
  private resolveMidleware(...middleware: Middleware[]): RequestHandler[] {
    return middleware.map((middlewareItem) => {
      const middlewareKey = getMiddlewareMetadata(middlewareItem);
      if (!this.container.isBound(middlewareKey)) {
        this.container.bind<any>(middlewareKey).to(middlewareItem as any);
      }
      const middlewareInstance = this.container.get<MiddlewareCore>(middlewareKey);
      return (req: Request, res: Response, next: NextFunction) => {
        middlewareInstance.handle(req, res, next);
      };
    });
  }
}
