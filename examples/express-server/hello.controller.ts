import { Request, Response } from "express";

import { Controller, Get } from "mioserv";
import { User } from "./users";
import { AuthRequired } from "./middleware";

@Controller({
  prefix: "/hello",
  middlewares: [ AuthRequired ]
})
export class HelloController {
  constructor(
    private user: User
  ) {}

  @Get("/", AuthRequired)
  public hello(_: Request, resp: Response) {
    resp.json(this.user.findOne());
  }
}
