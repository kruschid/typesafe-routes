import type { A } from "ts-toolbelt";
import { RenderContext } from "./createRoutes";
import type { AnyParam } from "./param";
import type { Renderer } from "./renderer";

// type If<Condition, Then> = Condition extends true ? Then : never;
type Unwrap<T> = T extends unknown[] ? T[number] : never;

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

export interface CreateRoutesOptions<RendererOutput> {
  renderer?: Renderer<RendererOutput>;
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
  RendererOutput,
  Params extends ParamRecordMap = ParamRecordMap
> = {
  _: RoutesContext<Routes, RendererOutput>;
  $template: () => string;
  $render: (params: ComputeParamRecordMap<Params>) => RendererOutput;
  $parseParams: (params: Record<string, any>) => Params["path"];
  $parseQuery: (params: Record<string, any>) => Params["query"];
  $bind: (
    params: ComputeParamRecordMap<Params>
  ) => RoutesContext<Routes, RendererOutput>;
  $from: (
    location: string,
    params: ComputePartialParamRecordMap<Params>
  ) => RoutesContext<Routes, RendererOutput>;
  $replace: (
    location: string,
    params: ComputePartialParamRecordMap<Params>
  ) => string;
} & {
  [Segment in keyof Routes]: RoutesContext<
    Routes[Segment]["children"] & {}, // shortcut to exclude undefined
    RendererOutput,
    Params & RouteNodeToParamRecordMap<Routes[Segment]>
  >;
};

export type CreateRoutes = <
  Routes extends RouteNodeMap,
  RendererOutput = string
>(
  routes: Routes,
  options?: CreateRoutesOptions<RendererOutput>
) => RoutesContext<Routes, RendererOutput>;
