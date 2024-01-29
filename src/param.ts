export type ParamKind = "optional" | "required";

export type AnyParam = Param<string, any, any>;

export type Param<N = string, T = any, K extends ParamKind = "required"> = {
  name: N;
  kind: K;
  parser: Parser<T>;
} & (K extends "required" ? { optional: Param<N, T, "optional"> } : {});

export interface Parser<T> {
  parse: (value: string) => T;
  serialize: (value: T) => string;
}

type ParamFn = <T>(
  parser: Parser<T>
) => <N extends string>(name: N) => Param<N, T, "required">;

export const param: ParamFn = (parser) => (name) => ({
  name,
  kind: "required",
  parser,
  optional: {
    name,
    kind: "optional",
    parser,
  } as Param<any, any, "optional">,
});

export const str = param({
  parse: (value: string) => value,
  serialize: (value: string) => value,
});

export const int = param({
  parse: (value: string) => {
    const result = parseInt(value, 10);
    if (isNaN(result)) {
      throw new Error(`parameter value is invalid: "${value}"`);
    }
    return result;
  },
  serialize: (value: number) => value.toString(),
});

export const float = (fractionDigits?: number) =>
  param({
    parse: (value: string) => {
      const result = parseFloat(value);
      if (isNaN(result)) {
        throw new Error(`parameter value is invalid: "${value}"`);
      }
      return result;
    },
    serialize: (value: number) => value.toFixed(fractionDigits),
  });

export const isoDate = param({
  parse: (value: string) => {
    const timestamp = Date.parse(value);
    if (isNaN(timestamp)) {
      throw new Error(`parameter value is invalid: "${value}"`);
    }
    return new Date(timestamp);
  },
  serialize: (value: Date) => value.toISOString(),
});

export const date = param({
  parse: (value: string) => {
    const timestamp = Date.parse(value);
    if (isNaN(timestamp)) {
      throw new Error(`parameter value is invalid: "${value}"`);
    }
    return new Date(timestamp);
  },
  serialize: (value: Date) => value.toISOString().slice(0, 10),
});

export const bool = param({
  parse: (value: string) => value === "true",
  serialize: (value: boolean) => value.toString(),
});

export const oneOf = (...list: string[]) =>
  param({
    parse: (value: string) => {
      if (!list.includes(value)) {
        throw new Error(`"${value}" is none of ${list.join(",")}`);
      }
      return value;
    },
    serialize: (value: string) => value,
  });

export const list = (allowedItems: string[], separator = ";") =>
  param({
    parse: (value: string) => {
      const items = value.split(separator);
      items.forEach((item) => {
        if (!allowedItems.includes(item)) {
          throw new Error(
            `"${item}" in ${value} is unknown. The allowed items are ${allowedItems.join(
              ","
            )}`
          );
        }
      });
      return items;
    },
    serialize: (items: string[]) => items.join(separator),
  });
