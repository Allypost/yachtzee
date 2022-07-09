import {
  isType,
} from "rambdax/immutable";
import {
  Primitive,
} from "type-fest";

type Serialized<T> =
  T extends (infer U)[]
    ? Serialized<U>[]
    : T extends Serializable
      ? ReturnType<T["serialize"]>
      : T extends Primitive
        ? T
        : T extends Map<infer K, infer V>
          ? { [k in K & (string | number | symbol)]: Serialized<V> }
          : { [K in keyof T]: Serialized<T[K]> }
  ;

export interface Serializable {
  serialize();
}

const isSerializable =
  (obj: unknown): obj is Serializable =>
    isType("Object", obj) &&
    "serialize" in (obj as Record<string, unknown>)
;

export const serialize =
  <T>(obj: T): Serialized<T> => {
    if (Array.isArray(obj)) {
      return obj.map(serialize) as Serialized<T>;
    }

    if (obj instanceof Map) {
      return serialize(Object.fromEntries(obj.entries()));
    }

    if (isSerializable(obj)) {
      return serialize(obj.serialize());
    }

    if (isType("Object", obj)) {
      const serialized = {
        ...obj,
      };

      for (const key of Object.keys(serialized)) {
        serialized[key] = serialize(serialized[key]);
      }

      return serialized as Serialized<T>;
    }

    return obj as Serialized<T>;
  }
;
