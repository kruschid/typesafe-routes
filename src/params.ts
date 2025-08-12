import type { Param, ParamOptions, Parser } from "./types";

export const param = <T>(parser: Parser<T>) => {
  const fn = <N extends string>(
    name: N,
    options?: ParamOptions<T>,
  ): Param<N, T, "required"> => ({
    name,
    parser,
    kind: "required",
    options,
  });

  fn.optional = <N extends string>(
    name: N,
    options?: ParamOptions<T>,
  ): Param<N, T, "optional"> => ({
    name,
    parser,
    kind: "optional",
    options,
  });
  return fn;
};

export const str = param({
  parse: (value: string) => value,
  serialize: (value: string) => value,
});

export const int = param({
  parse: (value: string) => {
    const result = parseInt(value, 10);
    if (Number.isNaN(result)) {
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
      if (Number.isNaN(result)) {
        throw new Error(`parameter value is invalid: "${value}"`);
      }
      return result;
    },
    serialize: (value: number) => value.toFixed(fractionDigits),
  });

export const isoDate = param({
  parse: (value: string) => {
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      throw new Error(`parameter value is invalid: "${value}"`);
    }
    return new Date(timestamp);
  },
  serialize: (value: Date) => value.toISOString(),
});

export const date = param({
  parse: (value: string) => {
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
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
              ",",
            )}`,
          );
        }
      });
      return items;
    },
    serialize: (items: string[]) => items.join(separator),
  });
