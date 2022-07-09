/**
 * Contract source: https://bit.ly/3DP1ypf
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import "@japa/runner";
import type {
  SinonSandbox,
} from "sinon";

declare module "@japa/runner" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface TestContext {
    sinon: SinonSandbox;
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions,@typescript-eslint/no-empty-interface,@typescript-eslint/no-unused-vars
  interface Test<TestData> {
    // Extend test
  }
}
