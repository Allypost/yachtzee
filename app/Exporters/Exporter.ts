import type {
  Primitive,
} from "type-fest";

// eslint-disable-next-line
type ExportObject = { [x: string]: ExportValue };
type ExportArray = ExportValue[];
export type ExportValue = Primitive | ExportObject | ExportArray;

export type Exporter = {
  export<T extends ExportValue>(data: T, ...args: unknown[]): Promise<unknown>;
}
