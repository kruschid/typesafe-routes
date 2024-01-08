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
