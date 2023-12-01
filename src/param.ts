export type ParamKind = "optional" | "required";

export type Param<N = string, T = any, K extends ParamKind = "required"> = {
  name: N;
  kind: K;
  parser: Parser<T>;
  optional: K extends "required" ? Param<N, T, "optional"> : never;
};

export interface Parser<T> {
  parse: (value: string) => T;
  serialize: (value: T) => string;
}

type ParamFn = <T>(
  parser: Parser<T>
) => <N extends string, K extends ParamKind = "required">(
  name: N
) => Param<N, T, K>;

export const param: ParamFn = (parser) => (name) =>
  ({
    name,
    kind: "required",
    parser,
    optional: {
      name,
      kind: "optional",
      parser,
      optional: undefined,
    },
  } as Param<any, any, any>);
