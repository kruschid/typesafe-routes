import { StringLiteral } from "typescript";
import { Param, ParamKind } from "./param";
import { int } from "./parser";

type ParserMap<T extends Param> = {
  [K in T["name"]]: Extract<T, { name: K }>["parser"];
};

type FilterParams<
  P extends Param<any, any, any>,
  Filter extends ParamKind[0]
> = {
  [K in Extract<P, { kind: [Filter, "required"] }>["name"]]: ReturnType<
    Extract<P, { name: K }>["parser"]["parse"]
  >;
} & {
  [K in Extract<P, { kind: [Filter, "optional"] }>["name"]]?: ReturnType<
    Extract<P, { name: K }>["parser"]["parse"]
  >;
};

type Unwrap<T> = T extends (infer U)[] ? U : never;

type RouteFn = <P extends Param<any, any, any>>(
  segments: (P | string)[]
) => {
  parserMap: ParserMap<P>;
  pathParams: FilterParams<P, "path">;
  queryParams: FilterParams<P, "query">;
  hashParam: FilterParams<P, "hash">;
  // template: Template<P>;
};

export const route: RouteFn = (segments) => null as any;

type RouteTag = <
  S extends string,
  P extends Param<any, any, any>[], // inference breaks if this is not extended from an array
  UP extends Param<any, any, any> = Unwrap<P>
>(
  strings: readonly S[],
  ...params: P
) => {
  parserMap: ParserMap<UP>;
  pathParams: FilterParams<UP, "path">;
  queryParams: FilterParams<UP, "query">;
  hashParam: FilterParams<UP, "hash">;
  // template: Template<P>;
  strings: S;
  params: P;
};

const routeTag: RouteTag = (strings, ...params) => {
  return null as any;
};

const t = routeTag`user/${int("id")}/details/${int("limit").optional}`;
