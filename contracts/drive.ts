/**
 * Contract source: https://git.io/JBt3I
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import type {
 InferDisksFromConfig,
} from "@adonisjs/core/build/config";
import type driveConfig from "../config/drive";

declare module "@ioc:Adonis/Core/Drive" {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  type DisksList = InferDisksFromConfig<typeof driveConfig>
}
