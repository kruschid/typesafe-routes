export interface Parser<T> {
  parse: (s: string) => T;
  serialize: (x: T) => string;
}

export const stringParser: Parser<string> = {
  parse: (s) => s,
  serialize: (s) => s,
}
export const floatParser: Parser<number> = {
  parse: (s) => parseFloat(s),
  serialize: (x) => x.toString(),
}
export const intParser: Parser<number> = {
  parse: (s) => parseInt(s),
  serialize: (x) => x.toString(),
}
export const dateParser: Parser<Date> = {
  parse: (s) => new Date(s),
  serialize: (d) => d.toISOString(),
}
export const booleanParser: Parser<boolean> = {
  parse: (s) => s === "true",
  serialize: (b) => b.toString(),
}
