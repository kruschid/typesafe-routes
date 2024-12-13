import type { A } from "ts-toolbelt";

type Unwrap<T> = T extends unknown[] ? T[number] : never;

export type ParamKind = "optional" | "required";

export type AnyParam = Param<string, any, any>;

export interface ParamOptions {
  template?: string;
}

export type Param<N = string, T = any, K extends ParamKind = "required"> = {
  name: N;
  options?: ParamOptions;
  kind: K;
  parser: Parser<T>;
};

export interface Parser<T> {
  parse: (value: string) => T;
  serialize: (value: T) => string;
}

export type RouteNode = {
  path?: (string | AnyParam)[];
  template?: string;
  query?: AnyParam[];
  children?: RouteNodeMap;
  meta?: any;
};
export type RouteNodeMap = Record<string, RouteNode>;

/**
 * ParamsRecord<
 *   { kind: "required"; name: "a"; parser: Parser<string> } |
 *   { kind: "optional"; name: "b"; parser: Parser<nubmer> } |
 *   ...
 * > => {
 *  [a]: string,
 *  [b]?: number,
 *  ...
 * }
 */
type ParamsRecord<Params extends RouteNode["path"]> = ComputeParamRecord<
  Exclude<Unwrap<Params>, string | undefined>
>;
type ComputeParamRecord<Params extends AnyParam> = A.Compute<
  {
    [K in Extract<Params, { kind: "required" }>["name"]]: ReturnType<
      Extract<Params, { name: K }>["parser"]["parse"]
    >;
  } & {
    [K in Extract<Params, { kind: "optional" }>["name"]]?: ReturnType<
      Extract<Params, { name: K }>["parser"]["parse"]
    >;
  }
>;

type ParamsMap<R extends WithContext> = {
  path: ParamsRecord<R["~context"]["pathSegments"]>;
  query: ParamsRecord<R["~context"]["querySegments"]>;
};

export type RoutesProps<
  Routes extends RouteNodeMap,
  Path extends RouteNode[] = []
> = {
  "~context": Context<Path>;
  _: RoutesProps<Routes>;
} & {
  [Segment in keyof Routes]: RoutesProps<
    Routes[Segment]["children"] & {}, // this shortcut excludes undefined
    [...Path, Routes[Segment]]
  >;
};

export interface Context<Path extends RouteNode[] = RouteNode[]> {
  path: string[];
  routes: RouteNode[];
  pathSegments: Unwrap<Path>["path"] & {};
  querySegments: Unwrap<Path>["query"] & {};
  skippedRoutes: RouteNode[];
  children?: RouteNodeMap;
  rootRoutes: RouteNodeMap;
  isRelative: boolean;
}

export type CreateRoutes = <Routes extends RouteNodeMap>(
  routes: Routes
) => RoutesProps<Routes>;

export interface WithContext {
  "~context": Context;
}

export type TemplateFn = <R extends WithContext>(route: R) => string;

export type RenderPathFn = <R extends WithContext>(
  route: R,
  params: ParamsRecord<R["~context"]["pathSegments"]>
) => string;

export type RenderQueryFn = <R extends WithContext>(
  route: R,
  params: ParamsRecord<R["~context"]["querySegments"]>
) => string;

export type RenderFn = <R extends WithContext>(
  route: R,
  params: ParamsMap<R>
) => string;

export type ParsePathFn = <R extends WithContext>(
  route: R,
  paramsOrLocation: Record<string, string> | string
) => ParamsRecord<R["~context"]["pathSegments"]>;

export type ParseQueryFn = <R extends WithContext>(
  route: R,
  paramsOrQuery: Record<string, string> | string
) => ParamsRecord<R["~context"]["querySegments"]>;

export type ParseFn = <R extends WithContext>(
  route: R,
  paramsOrLocation: Record<string, string> | string
) => ParamsMap<R>;

export type ReplaceFn = <R extends WithContext>(
  route: R,
  location: string,
  params: Partial<ParamsMap<R>>
) => string;

export type InferParams<R extends WithContext> = ParamsMap<R>;
