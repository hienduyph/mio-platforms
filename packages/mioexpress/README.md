# mioexpress
Use Dependency Injection (DI) to build the express app.

## Motivations
I love inversify and the simplicity of this. But the `express-utils` of inversify doesn't meet my requirements. And I need somehow to create the express app as fast as possible without overhead.

## Installation
```bash
$ yarn add mioexpress
# or
$ npm install --save mioexpress
```

### Step 1: Define services with interfaces
```typescript
// user.repo.ts
import { Injectable } from "miocore";

@Injectable()
export abstract class UserRepo {
  public abstract findOne(): any;
}

// implement the abstract class/interface above
@Injectable()
export class UserMongoRepo implements UserRepo {
  public findOne() {
    return { username: "q" };
  }
}
```

### Step 2: Create the controller
```typescript
// user.controller.ts

import { Request, Response } from "express";
import { Controller, Get } from "mioexpress";

import { UserRepo } from "./user.repo";

@Controller({
  prefix: "/users"
})
export class UserController {
  constructor(
    private userRepo: UserRepo
  ) {}

  @Get("/")
  public getOne(_: Request, resp: Response) {
    resp.json(this.userRepo.findOne());
  }
}
```

### Step 3: Create the container and express server
```typescript
// main.ts
import { Container } from "miocore";
import { Server } from "mioexpress";

import { UserRepo, UserMongoRepo } from "./user.repo";
import { UserController } from "./user.controller";

const container = new Container();
container.register({ target: UserRepo, implementation: UserMongoRepo });

// create server
const server = new Server(container);
// register the controller
server.register([
  UserController
]);

// listening
const app = server.build();
app.listen(3000, () => {
  console.log("Server listening...");
});
// navigate to http://localhost:3000/users
```
