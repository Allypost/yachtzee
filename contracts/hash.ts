/**
 * Contract source: https://git.io/Jfefs
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import type {
 InferListFromConfig,
} from "@adonisjs/core/build/config";
import type hashConfig from "../config/hash";

declare module "@ioc:Adonis/Core/Hash" {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  type HashersList = InferListFromConfig<typeof hashConfig>
}
