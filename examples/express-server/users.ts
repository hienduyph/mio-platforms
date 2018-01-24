import { Injectable } from "mioc-core";

@Injectable()
export abstract class Address {
  public abstract find(): string;
}

@Injectable()
export abstract class Home {
  public abstract find(): string;
}

@Injectable()
export class QAddress implements Address {
  public find() {
    return "HCMC";
  }
}

@Injectable()
export class QHome implements Home {
  public find() {
    return "Vincom";
  }
}

@Injectable()
export class User {
  constructor(
    public home: Home,
    public address: Address
  ) {}

  public findOne() {
    return {
      home: this.home.find(),
      address: this.address.find()
    };
  }
}
