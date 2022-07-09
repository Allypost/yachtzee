import {
  random,
} from "rambdax";
import {
  Serializable,
  serialize,
} from "App/Meta/Serializable";

export class Die implements Serializable {
  private held = false;

  private value: number;

  constructor(value?: number) {
    this.value = value ?? this.roll();
  }

  public isHeld() {
    return this.held;
  }

  public hold() {
    this.held = true;
  }

  public release() {
    this.held = false;
  }

  public getValue() {
    return this.value;
  }

  public roll() {
    if (!this.isHeld()) {
      this.value = random(1, 6);
    }

    return this.value;
  }

  public asReadonly(): this {
    return new Proxy(this, {
      get(target, prop) {
        if ("roll" === prop) {
          return () => target.value;
        }

        return target[prop];
      },
    });
  }

  public serialize() {
    return serialize({
      held: this.held,
      value: this.value,
    });
  }
}
