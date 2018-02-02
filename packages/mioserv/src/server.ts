import { Router, Application, RequestHandler } from "express";
const express = require("express");
import { Container, getInjectableMetadata, NewAble } from "miocore";
import { join } from "path";

import { getControllerMetadata } from "./controller";
import { Middleware, MiddlewareCore, getMiddlewareMetadata } from "./middleware";
import { getControllerMethodMetadata } from "./http_method";
import { RoutingConfig } from "./config";

/**
 * Connect express server to inversify container
 */
export class MioServer {
  private router: Router;
  private container: Container;
  private app: Application;
  private routingConfig: RoutingConfig;

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
   * Register a middleware into the express app
   */
  public useMiddlewares(...middlewares: Middleware[]) {
    middlewares.forEach((middleware) => {
      this.app.use(this.routingConfig.rootPath, this.resolveMidleware(middleware));
    });
  }

  /**
   * Register the controllers list to the express app
   */
  public register(controllers: NewAble<any>[] = []) {
    this.registerControllers(controllers);
  }

  /**
   * Get the actual app
   */
  public express() {
    return this.app;
  }

  /**
   * Resolve controllers
   * @param controllers list of controller constructor
   */
  private registerControllers(controllers: NewAble<any>[] = []) {
    if (controllers.length < 1) {
      return this;
    }
    // loop though all controller constructors and create the controller instance
    const controllerInstances = controllers.map((constructor) => {
      const name = getInjectableMetadata(constructor).uuid();
      if (this.container.isBound(name)) {
        throw new Error(`Two controllers cannot have the same name: ${name}`);
      }
      this.container.register(constructor);
      return this.container.get(name);
    });

    controllerInstances.forEach((controller: any) => {
      const controllerMetadata = getControllerMetadata<any>(controller.constructor);
      const methodMetadatas = getControllerMethodMetadata<any>(controller.constructor);
      if (controllerMetadata && methodMetadatas) {
        const controllerMiddleware = this.resolveMidleware(...controllerMetadata.middlewares);

        methodMetadatas.forEach((metadata) => {
          // get the main handler of this method
          const handler: RequestHandler = controller[metadata.key].bind(controller);
          const routeMiddleware = this.resolveMidleware(...metadata.middleware);
          // assign the method with middlware
          (this.router as any)[metadata.method](
            this.resolvePath(controllerMetadata.prefix, metadata.path),
            ...controllerMiddleware,
            ...routeMiddleware,
            handler,
          );
        });
      }
    });
    this.app.use(this.routingConfig.rootPath, this.router);
    return this;
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
      return middlewareInstance.handle.bind(middlewareInstance);
    });
  }

  /**
   * Resolve path for api endpoint
   */
  private resolvePath(prefix: string, path: string) {
    let result = join(prefix, path);
    result = result
      // remove slash first
      .replace(new RegExp("(^\/)"), "")
      // remove stash end
      .replace(new RegExp("(\/$)"), "");
    // append slash first
    return `/${result}`;
  }
}
