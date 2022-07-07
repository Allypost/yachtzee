import {
  random,
} from "rambdax";

export class Die {
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
}
