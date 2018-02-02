import { Request, Response } from "express";

import { Controller, Get } from "mioserv";
import { User } from "./users";
import { AuthRequired, AdminRequired } from "./middleware";

@Controller({
  prefix: "/hello",
})
export class HelloController {
  constructor(
    private user: User,
  ) {}

  @Get("/", AuthRequired)
  public hello(_: Request, resp: Response) {
    resp.json(this.user.findOne());
  }

  @Get("/world", AdminRequired)
  public world(_: Request, resp: Response) {
    resp.json(this.user.findOne());
  }
}
