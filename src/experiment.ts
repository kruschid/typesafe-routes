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
 *  query: never,
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
export type ParamRecordMap<T = unknown> = Record<"path" | "query", T>;

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
  "~params": Params;
  "~path": string[];
  "~routes": Routes;
  "~context": RenderContext;
  _: RoutesProps<Routes>;
} & {
  [Segment in keyof Routes]: RoutesProps<
    Routes[Segment]["children"] & {}, // this shortcut excludes undefined
    A.Compute<Params & RouteNodeToParamRecordMap<Routes[Segment]>>
  >;
};

export type RenderContext = {
  // contains leading nodes that were skipped in a relative path
  skippedNodes: RouteNode[];
  nodes: RouteNode[];
  pathSegments: Exclude<RouteNode["path"], undefined>;
  querySegments: Exclude<RouteNode["query"], undefined>;
  isRelative: boolean;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
  // todo: explain these properties
  // will be resetted each time a parentContext gets inherited
  currentPathSegments: Exclude<RouteNode["path"], undefined>;
  currentQuerySegments: Exclude<RouteNode["query"], undefined>;
};

export type CreateRoutes<Meta = any> = <
  Routes extends RouteNodeMap<Meta>,
>(
  routes: Routes
) => RoutesProps<Routes>;

type RouteWithParams = { "~params": ParamRecordMap }

type InferParams<Route extends RouteWithParams> = Route["~params"];

type BindFn = <
  Route extends RouteWithParams
>(route: Route, params: InferParams<Route>) => Route;

type TemplateFn = <
  Routes extends RouteNodeMap,
  Params extends ParamRecordMap
>(route: RoutesProps<Routes, Params>) => string;

type RenderFn = <
  Routes extends RouteNodeMap,
  Params extends ParamRecordMap
>(route: RoutesProps<Routes, Params>, params: ComputeParamRecordMap<Params>) => string;

type ParseParamsFn = <
  Routes extends RouteNodeMap,
  Params extends ParamRecordMap
>(route: RoutesProps<Routes, Params>, params: Record<string, string> | string) => ComputeParamRecordMap<Params>;

type FromFn = <
  Routes extends RouteNodeMap,
  Params extends ParamRecordMap
>(route: RoutesProps<Routes, Params>, location: string, params: Record<string, string>) => RoutesProps<Routes>;

type ReplaceFn = <
  Routes extends RouteNodeMap,
  Params extends ParamRecordMap
>(route: RoutesProps<Routes, Params>, location: string, params: Record<string, string>) => string;

const fn: CreateRoutes = null as any;

const r = fn({
  test: {
    path: [str("sd")]
  }
});

type p = InferParams<(typeof r.test)>


// export type InferParams<
//   R extends {
//     $parseParams: (...p: any[]) => any;
//     $parseQuery: (...p: any[]) => any;
//   }
// > = ComputeParamRecordMap<{
//   path: ReturnType<R["$parseParams"]>;
//   query: ReturnType<R["$parseQuery"]>;
// }>;
