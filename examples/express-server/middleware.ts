import { Request, Response, NextFunction } from "express";
import { MiddlewareCore, Middleware } from "mioserv";

import { User } from "./users";

@Middleware()
export class AuthRequired implements MiddlewareCore {
  protected role = "user";

  constructor(protected user: User) {}

  public handle(_: Request, __: Response, next: NextFunction) {
    console.log(this.role);
    console.log("middleware run", this.user);
    next();
  }
}

@Middleware()
export class AdminRequired extends AuthRequired {
  protected role = "admin";
}

@Middleware()
export class CorsMiddleware implements MiddlewareCore {
  public handle(_: Request, __: Response, next: NextFunction) {
    console.log("COrs middleware");
    next();
  }
}

@Middleware()
export class ErrorMiddleware implements MiddlewareCore {
  public handle(err: any, _: Request, resp: Response, __: NextFunction) {
    console.error("Error handler", err);
    resp.json({ error: err.message });
  }
}
