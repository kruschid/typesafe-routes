import type { A } from "ts-toolbelt";
import { str } from "./params";

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

/**
 * ExcludeEmptyProperties<{
 *  path: {param: string},
 *  query: {}
 * }> => {
 *  path: {param: string},
 * }
 */
export type ExcludeEmptyProperties<T> = Pick<
  T,
  {
    [K in keyof T]: keyof T[K] extends never ? never : K;
  }[keyof T]
>;

export type RouteNode<Meta = any> = {
  path?: (string | AnyParam)[];
  template?: string;
  query?: AnyParam[];
  children?: RouteNodeMap<Meta>;
  meta?: Meta;
};
export type RouteNodeMap<Meta = any> = Record<string, RouteNode<Meta>>;

/**
 * RouteNodeToParamRecordMap<{
 *  path?: (string | AnyParamParam<TName, TValue>)[];
 *  query?: Param<TName, TValue>[];
 *  children?: RouteNodeMap;
 * }> => {
 *  path: {[TName]: TValue, ...},
 *  query: {[TName]: TValue, ...}
 * }
 */
export type RouteNodeToParamRecordMap<T extends RouteNode> = {
  path: ExtractParamRecord<Exclude<Unwrap<T["path"]>, string | undefined>>;
  query: ExtractParamRecord<Exclude<Unwrap<T["query"]>, undefined>>;
};
export type ParamRecordMap<T = any> = Record<"path" | "query", T>;

/**
 * ExtractParamRecord<{
 *  kind: "required" | "optional";
 *  name: TName;
 *  parser: Parser<TParseType>
 * } | {...}> => {
 *  [TName]: TParseType,
 *  [TName]?: TParseType,
 *  ...
 * }
 */
export type ExtractParamRecord<Params extends AnyParam> = {
  [K in Extract<Params, { kind: "required" }>["name"]]: ReturnType<
    Extract<Params, { name: K }>["parser"]["parse"]
  >;
} & {
  [K in Extract<Params, { kind: "optional" }>["name"]]?: ReturnType<
    Extract<Params, { name: K }>["parser"]["parse"]
  >;
};

type ComputeParamRecordMap<Params extends ParamRecordMap> = A.Compute<
  ExcludeEmptyProperties<Params>
>;

type ComputePartialParamRecordMap<Params extends ParamRecordMap> = A.Compute<
  ExcludeEmptyProperties<{
    path: Partial<Params["path"]>;
    query: Partial<Params["query"]>;
  }>
>;

export type RoutesProps<
  Routes extends RouteNodeMap,
  Params extends ParamRecordMap = ParamRecordMap
> = {
  "~context": Context;
  "~params": Params;
  _: RoutesProps<Routes>;
} & {
  [Segment in keyof Routes]: RoutesProps<
    Routes[Segment]["children"] & {}, // this shortcut excludes undefined
    A.Compute<Params & RouteNodeToParamRecordMap<Routes[Segment]>>
  >;
};

export interface Context {
  path: string[];
  routes: RouteNode[];
  pathSegments: Exclude<RouteNode["path"], undefined>;
  querySegments: Exclude<RouteNode["query"], undefined>;
  skippedRoutes: RouteNode[];
  children?: RouteNodeMap;
  rootRoutes: RouteNodeMap;
  isRelative: boolean;
}

export type CreateRoutes<Meta = any> = <Routes extends RouteNodeMap<Meta>>(
  routes: Routes
) => RoutesProps<Routes>;

export interface WithContext {
  "~context": Context;
  "~params": ParamRecordMap;
}

export type TemplateFn = <R extends WithContext>(route: R) => string;

export type RenderPathFn = <R extends WithContext>(
  route: R,
  params: R["~params"]["path"]
) => string;

export type RenderQueryFn = <R extends WithContext>(
  route: R,
  params: R["~params"]["query"]
) => string;

export type RenderFn = <R extends WithContext>(
  route: R,
  params: ComputeParamRecordMap<R["~params"]>
) => string;

export type ParsePathFn = <R extends WithContext>(
  route: R,
  paramsOrLocation: Record<string, string> | string
) => R["~params"]["path"];

export type ParseQueryFn = <R extends WithContext>(
  route: R,
  paramsOrQuery: Record<string, string> | string
) => R["~params"]["query"];

export type ParseFn = <R extends WithContext>(
  route: R,
  paramsOrLocation: Record<string, string> | string
) => ComputeParamRecordMap<R["~params"]>;

export type FromFn = <R extends WithContext>(
  route: R,
  location: string,
  params: ComputeParamRecordMap<R["~params"]>
) => R;

export type ReplaceFn = <R extends WithContext>(
  route: R,
  location: string,
  params: ComputeParamRecordMap<R["~params"]>
) => string;

type InferParams<R extends WithContext> = R["~params"];
