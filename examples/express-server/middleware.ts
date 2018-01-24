import { Request, Response, NextFunction } from "express";
import { MiddlewareCore, Middleware } from "mioserv";

import { User } from "./users";

@Middleware()
export class AuthRequired implements MiddlewareCore {
  constructor(private user: User) {}

  public handle(_: Request, __: Response, next: NextFunction) {
    console.log("middleware run", this.user);
    next();
  }
}
