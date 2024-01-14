export type ParamKind = "optional" | "required";

export type AnyParam = Param<string, any, any>;

export type Param<N = string, T = any, K extends ParamKind = "required"> = {
  name: N;
  kind: K;
  parser: Parser<T>;
  value?: string;
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

export const int = param({
  parse: (value: string) => {
    const result = parseInt(value, 10);
    if (result !== result) {
      throw new Error(`parameter value is invalid: "${result}"`);
    }
    return result;
  },
  serialize: (value: number) => value.toString(),
});

export const str = param({
  parse: (value: string) => value,
  serialize: (value: string) => value,
});

export const float = (fractionDigits?: number) =>
  param({
    parse: (value: string) => parseFloat(value),
    serialize: (value: number) => value.toFixed(fractionDigits),
  });

export const isoDate = param({
  parse: (value: string) => new Date(value),
  serialize: (value: Date) => value.toISOString(),
});

export const date = param({
  parse: (value: string) => new Date(value),
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

export const list = (_: string[], separator = ";") =>
  param({
    parse: (value: string) => value.split(separator),
    serialize: (options: string[]) => options.join(separator),
  });

export const json = <T>() =>
  param({
    parse: (value: string) => JSON.parse(value),
    serialize: (value: T) => JSON.stringify(value),
  });

export const base64 = <T>() =>
  param({
    parse: (value) => JSON.parse(window.btoa(value)),
    serialize: (value: T) => window.atob(JSON.stringify(value)),
  });
