import type { A } from "ts-toolbelt";
import type { AnyParam } from "./param";
import type { RenderContext, Renderer } from "./renderer";

type If<Condition, Then> = Condition extends true ? Then : never;
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
type ExcludeEmptyProperties<T> = Pick<
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

/**
 * ExtractPathSuggestions<{
 *  childA: {
 *    ...,
 *    childrend: {
 *      childB: {
 *        ...
 *      }
 *    }
 *  }
 * }> =>
 *  | "childA"
 *  | "childA/childB"
 *  | "childA/_childB"
 */
export type ExtractPathSuggestions<
  T extends RouteNodeMap,
  IsTemplate = false,
  IsAbsolute = true
> = {
  // K = NodeName
  [K in keyof T]: K extends string // filters out symbol and number
    ? T[K]["children"] extends object // has children
      ?
          | K
          | `${K}/${ExtractPathSuggestions<T[K]["children"], IsTemplate>}`
          | If<
              IsAbsolute,
              `${K}/_${ExtractPathSuggestions<
                T[K]["children"],
                IsTemplate,
                false
              >}`
            >
      : T[K]["template"] extends string
      ? If<IsTemplate, K>
      : K
    : never;
}[keyof T];

/**
 * PathToParamRecordMap<
 *  "segement/segment/segment",
 *  {segment: {..., children: {segment: {..., children: {segment}}}}},
 *  {path: {...}, query: {...}}
 * > => { param: type, ...}
 */
export type PathToParamRecordMap<
  Path extends string,
  Route extends RouteNodeMap,
  Params extends ParamRecordMap = ParamRecordMap
> = Path extends `_${infer Segment}/${infer Rest}` // partial route segment (drop all previous options)
  ? PathToParamRecordMap<
      Rest,
      Route[Segment]["children"] & {}, // shortcut to exclude undefined
      RouteNodeToParamRecordMap<Route[Segment]>
    >
  : Path extends `${infer Segment}/${infer Rest}` // regular segment (concat options)
  ? PathToParamRecordMap<
      Rest,
      Route[Segment]["children"] & {}, // shortcut to exclude undefined
      Params & RouteNodeToParamRecordMap<Route[Segment]>
    >
  : Path extends `_${infer Segment}` // partial route in the final segment (drop previous options and discontinue)
  ? RouteNodeToParamRecordMap<Route[Segment]>
  : Params & RouteNodeToParamRecordMap<Route[Path]>;

/**
 * ExtractRouteNodeMapByPath<
 *  "segement/segment",
 *  {segment: {..., children: {segment: {..., children: {segment: { ... }}}}}},
 * > => {segment: { ... }},
 */
export type ExtractRouteNodeMapByPath<
  Path extends string,
  Route extends RouteNodeMap
> = Path extends `_${infer Segment}/${infer Rest}` // partial route segment (drop all previous options)
  ? ExtractRouteNodeMapByPath<
      Rest,
      Route[Segment]["children"] & {} // shortcut to exclude undefined
    >
  : Path extends `${infer Segment}/${infer Rest}` // regular segment (concat options)
  ? ExtractRouteNodeMapByPath<
      Rest,
      Route[Segment]["children"] & {} // shortcut to exclude undefined
    >
  : Path extends `_${infer Segment}` // partial route in the final segment (drop previous options and discontinue)
  ? Route[Segment]["children"] & {}
  : Route[Path]["children"] & {};

export type RoutesContext<Routes extends RouteNodeMap> = {
  template: (path: ExtractPathSuggestions<Routes, true>) => string;
  render: <Path extends ExtractPathSuggestions<Routes>>(
    ...args:
      | [
          path: Path,
          params: A.Compute<
            ExcludeEmptyProperties<PathToParamRecordMap<Path, Routes>>
          >
        ]
      | []
  ) => string;
  parseParams: <Path extends ExtractPathSuggestions<Routes>>(
    path: Path,
    params: Record<string, any>
  ) => PathToParamRecordMap<Path, Routes>["path"];
  parseQuery: <Path extends ExtractPathSuggestions<Routes>>(
    path: Path,
    params: Record<string, any>
  ) => PathToParamRecordMap<Path, Routes>["query"];
  bind: <Path extends ExtractPathSuggestions<Routes>>(
    path: Path,
    params: A.Compute<
      ExcludeEmptyProperties<PathToParamRecordMap<Path, Routes>>
    >
  ) => RoutesContext<ExtractRouteNodeMapByPath<Path, Routes>>;
  from: <Path extends ExtractPathSuggestions<Routes>>(
    path: Path,
    location: string,
    params: A.Compute<
      ExcludeEmptyProperties<{
        path: Partial<PathToParamRecordMap<Path, Routes>["path"]>;
        query: Partial<PathToParamRecordMap<Path, Routes>["query"]>;
      }>
    >
  ) => RoutesContext<ExtractRouteNodeMapByPath<Path, Routes>>;
  replace: <Path extends ExtractPathSuggestions<Routes>>(
    path: Path,
    location: string,
    params: A.Compute<
      ExcludeEmptyProperties<{
        path: Partial<PathToParamRecordMap<Path, Routes>["path"]>;
        query: Partial<PathToParamRecordMap<Path, Routes>["query"]>;
      }>
    >
  ) => string;
};

export type CreateRoutes = <Routes extends RouteNodeMap>(
  routes: Routes,
  renderer?: Renderer,
  prevCtx?: RenderContext,
  prevParams?: ParamRecordMap<any>
) => RoutesContext<Routes>;
