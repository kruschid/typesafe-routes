import { Param, ParamKind } from "./param";
import { float, int } from "./parser";

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

type RouteFn = <P extends Param<any, any, any>>(
  segments: (P | string)[]
) => {
  parserMap: ParserMap<P>;
  pathParams: FilterParams<P, "path">;
  queryParams: FilterParams<P, "query">;
  hashParam: FilterParams<P, "hash">;
};

export const route: RouteFn = (segments) => null as any;

const f2 = float(2);

// user/:id/details/:time
const rr = route([
  "user",
  int("id").query,
  "details",
  f2("time").query.optional,
]);
