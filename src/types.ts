import type { A } from "ts-toolbelt";

type Unwrap<T> = T extends unknown[] ? T[number] : never;

export type ParamKind = "optional" | "required";

export type AnyParam = Param<string, any, any>;

export type Param<N = string, T = any, K extends ParamKind = "required"> = {
  name: N;
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

export interface RoutesOptions<PathType, TemplateType> {
  renderPath: (ctx: RenderContext) => PathType;
  renderTemplate: (
    ctx: RenderContext,
    options?: RoutesOptions<PathType, TemplateType>
  ) => TemplateType;
  templatePrefix?: boolean;
}

type ComputeParamRecordMap<Params extends ParamRecordMap> = A.Compute<
  ExcludeEmptyProperties<Params>
>;

type ComputePartialParamRecordMap<Params extends ParamRecordMap> = A.Compute<
  ExcludeEmptyProperties<{
    path: Partial<Params["path"]>;
    query: Partial<Params["query"]>;
  }>
>;

export type RoutesContext<
  Routes extends RouteNodeMap,
  Options extends RoutesOptions<any, any>,
  Params extends ParamRecordMap = ParamRecordMap
> = {
  _: RoutesContext<Routes, Options>;
  $template: () => ReturnType<Options["renderTemplate"]>;
  $render: (
    params: ComputeParamRecordMap<Params>
  ) => ReturnType<Options["renderPath"]>;
  $parseParams: (params: Record<string, any>) => Params["path"];
  $parseQuery: (params: Record<string, any>) => Params["query"];
  $bind: (
    params: ComputeParamRecordMap<Params>
  ) => RoutesContext<Routes, Options>;
  $from: (
    location: string,
    params: ComputePartialParamRecordMap<Params>
  ) => RoutesContext<Routes, Options>;
  $replace: (
    location: string,
    params: ComputePartialParamRecordMap<Params>
  ) => string;
} & {
  [Segment in keyof Routes]: RoutesContext<
    Routes[Segment]["children"] & {}, // shortcut to exclude undefined
    Options,
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

export type CreateRoutes = <
  Routes extends RouteNodeMap,
  Options extends RoutesOptions<any, any> = RoutesOptions<string, string>
>(
  routes: Routes,
  options?: Options,
  parentContext?: RenderContext
) => RoutesContext<Routes, Options>;
