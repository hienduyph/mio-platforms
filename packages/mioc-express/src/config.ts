import { Application } from "express";

export interface RoutingConfig {
  rootPath: string;
}

export interface ConfigFunction {
  (app: Application): void;
}
