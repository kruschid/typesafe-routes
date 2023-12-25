export type ParamKind = "optional" | "required";

export type AnyParam = Param<any, any, any>;

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
