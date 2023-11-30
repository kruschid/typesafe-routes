export type ParamKind = [
  "path" | "query" | "hash" | "state",
  "optional" | "required"
];

export interface Param<
  N = string,
  T = any,
  K extends ParamKind = ["path", "required"]
> {
  name: N;
  kind: K;
  parser: Parser<T>;
  optional: Param<N, T, [K[0], "optional"]>;
  query: Param<N, T, ["query", K[1]]>;
  hash: Param<N, T, ["hash", K[1]]>;
  state: Param<N, T, ["state", K[1]]>;
}

export interface Parser<T> {
  parse: (value: string) => T;
  serialize: (value: T) => string;
}

// todo:
// type ParamFn<>;

export const param =
  <T>(parser: Parser<T>) =>
  <N extends string, K extends ParamKind = ["path", "required"]>(
    name: N,
    [kind, constraint]: K = ["path", "required"] as K
  ): Param<N, T, K> => ({
    name,
    kind: [kind, constraint] as K,
    parser,
    // todo: proxy implementation (avoid infinite loops)
    optional: param(parser)(name, [kind, "optional"]),
    query: param(parser)(name, ["query", constraint]),
    hash: param(parser)(name, ["hash", constraint]),
    state: param(parser)(name, ["state", constraint]),
  });
