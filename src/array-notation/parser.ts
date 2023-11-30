import { param } from "./param";

export const int = param({
  parse: (value: string) => parseInt(value, 10),
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

export const bool = param({
  parse: (value: string) => value === "true",
  serialize: (value: boolean) => value.toString(),
});

export const oneOf = <T extends string>(..._: T[]) =>
  param({
    parse: (value: string) => value as T,
    serialize: (value: T) => value,
  });

export const list = <T extends string>(_: T[], separator = ";") =>
  param({
    parse: (value: string) => value.split(separator) as T[],
    serialize: (options: T[]) => options.join(separator),
  });
