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

export type RouteNode = {
  path?: (string | AnyParam)[];
  template?: string;
  query?: AnyParam[];
  children?: RouteNodeMap;
};
export type RouteNodeMap = Record<string, RouteNode>;

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
  Context extends AnyRenderContext,
  Params extends ParamRecordMap = ParamRecordMap
> = {
  $routes: Routes;
  $context: Context;
  _: RoutesProps<Routes, Context>;
  $template: () => ReturnType<Context["renderTemplate"]>;
  $render: (
    params: ComputeParamRecordMap<Params>
  ) => ReturnType<Context["renderPath"]>;
  $parseParams: (params: Record<string, any> | string) => Params["path"];
  $parseQuery: (params: Record<string, any> | string) => Params["query"];
  $bind: (
    params: ComputeParamRecordMap<Params>
  ) => RoutesProps<Routes, Context>;
  $from: (
    location: string,
    params: ComputePartialParamRecordMap<Params>
  ) => RoutesProps<Routes, Context>;
  $replace: (
    location: string,
    params: ComputePartialParamRecordMap<Params>
  ) => string;
} & {
  [Segment in keyof Routes]: RoutesProps<
    Routes[Segment]["children"] & {}, // shortcut to exclude undefined
    Context,
    A.Compute<Params & RouteNodeToParamRecordMap<Routes[Segment]>>
  >;
};

export type RenderContext<TemplateType, PathType> = {
  renderTemplate: (ctx: RenderContext<TemplateType, PathType>) => TemplateType;
  renderPath: (ctx: RenderContext<TemplateType, PathType>) => PathType;
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

export type AnyRenderContext = RenderContext<any, any>;

export type CreateRoutes = <
  Routes extends RouteNodeMap,
  Context extends AnyRenderContext = RenderContext<string, string>
>(
  routes: Routes,
  context?: Context
) => RoutesProps<Routes, Context>;

export type InferParams<
  R extends {
    $parseParams: (...p: any[]) => any;
    $parseQuery: (...p: any[]) => any;
  }
> = ComputeParamRecordMap<{
  path: ReturnType<R["$parseParams"]>;
  query: ReturnType<R["$parseQuery"]>;
}>;
