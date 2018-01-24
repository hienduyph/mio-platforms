// import polyfill
import "reflect-metadata";

import * as assert from "assert";
import { Injectable, Container } from "miocore";

// Step 1: Define abstract class as interface
@Injectable()
abstract class Warrior {
  public abstract fight(): string;
  public abstract sneak(): string;
}

@Injectable()
abstract class Weapon {
  public abstract hit(): string;
}

@Injectable()
abstract class ThrowableWeapon {
  public abstract throw (): string;
}

// Step 2: Implements the above abstract classes
@Injectable()
class Katana implements Weapon {
  public hit() {
    return "cut!";
  }
}

@Injectable()
class Shuriken implements ThrowableWeapon {
  public throw () {
    return "hit!";
  }
}

@Injectable()
class Ninja implements Warrior {
  public constructor(
    // we don't need @inject any more, just like the angular way
    private katana: Weapon,
    private shuriken: ThrowableWeapon
  ) {}

  public fight() {
    return this.katana.hit();
  }
  public sneak() {
    return this.shuriken.throw();
  }
}

// Step 3: Create out container
const myContainer = new Container();
myContainer
  .register({ target: Weapon, implementation: Katana })
  .register({ target: ThrowableWeapon, implementation: Shuriken })
  .register({ target: Warrior, implementation: Ninja });

const ninja = myContainer.get<Warrior>(Warrior);

assert(ninja.fight() === "cut!"); // true
assert(ninja.sneak() === "hit!"); // true
