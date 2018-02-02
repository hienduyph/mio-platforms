import "reflect-metadata";

import { MioServer } from "mioserv";
import { Container } from "miocore";

import { HelloController } from "./hello.controller";
import { User, QHome, QAddress, Address, Home } from "./users";

import { CorsMiddleware, ErrorMiddleware } from "./middleware";

const container = new Container();
container.register({ target: Home, implementation: QHome });
container.register({ target: Address, implementation: QAddress });
container.register(User);
const server = new MioServer(container);

server.useMiddlewares(CorsMiddleware);

// register list of controller
server.register([
  HelloController,
]);

server.useMiddlewares(ErrorMiddleware);

const app = server.express();

const port = +(process.env.PORT || 9999);
app.listen(port, () => {
  console.log(`Server listening ${port}`);
});
