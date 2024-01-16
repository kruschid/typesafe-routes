import { A } from "ts-toolbelt";
export type ParamKind = "optional" | "required";
export type AnyParam = Param<string, any, any>;
export type Param<N = string, T = any, K extends ParamKind = "required"> = {
    name: N;
    kind: K;
    parser: Parser<T>;
    value?: string;
} & (K extends "required" ? {
    optional: Param<N, T, "optional">;
} : {});
export interface Parser<T> {
    parse: (value: string) => T;
    serialize: (value: T) => string;
}
type ParamFn = <T>(parser: Parser<T>) => <N extends string>(name: N) => Param<N, T, "required">;
export const param: ParamFn;
export const int: <N extends string>(name: N) => Param<N, number, "required">;
export const str: <N extends string>(name: N) => Param<N, string, "required">;
export const float: (fractionDigits?: number | undefined) => <N extends string>(name: N) => Param<N, number, "required">;
export const isoDate: <N extends string>(name: N) => Param<N, Date, "required">;
export const date: <N extends string>(name: N) => Param<N, Date, "required">;
export const bool: <N extends string>(name: N) => Param<N, boolean, "required">;
export const oneOf: (...list: string[]) => <N extends string>(name: N) => Param<N, string, "required">;
export const list: (_: string[], separator?: string) => <N extends string>(name: N) => Param<N, string[], "required">;
export const json: <T>() => <N extends string>(name: N) => Param<N, T, "required">;
export const base64: <T>() => <N extends string>(name: N) => Param<N, T, "required">;
export type RenderContext = {
    skippedNodes: RouteNode[];
    nodes: RouteNode[];
    path: Exclude<RouteNode["path"], undefined>;
    query: Exclude<RouteNode["query"], undefined>;
    isRelative: boolean;
};
export type Renderer = {
    template: (ctx: RenderContext) => string;
    render: (segments: RenderContext, params: ParamRecordMap<Record<string, unknown>>) => string;
};
export const defaultRenderer: Renderer;
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
type ExcludeEmptyProperties<T> = Pick<T, {
    [K in keyof T]: keyof T[K] extends never ? never : K;
}[keyof T]>;
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
    [K in Extract<Params, {
        kind: "required";
    }>["name"]]: ReturnType<Extract<Params, {
        name: K;
    }>["parser"]["parse"]>;
} & {
    [K in Extract<Params, {
        kind: "optional";
    }>["name"]]?: ReturnType<Extract<Params, {
        name: K;
    }>["parser"]["parse"]>;
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
export type ExtractPathSuggestions<T extends RouteNodeMap, IsTemplate = false, IsAbsolute = true> = {
    [K in keyof T]: K extends string ? T[K]["children"] extends object ? K | `${K}/${ExtractPathSuggestions<T[K]["children"], IsTemplate>}` | If<IsAbsolute, `${K}/_${ExtractPathSuggestions<T[K]["children"], IsTemplate, false>}`> : T[K]["template"] extends string ? If<IsTemplate, K> : K : never;
}[keyof T];
/**
 * PathToParamRecordMap<
 *  "segement/segment/segment",
 *  {segment: {..., children: {segment: {..., children: {segment}}}}},
 *  {path: {...}, query: {...}}
 * > => { param: type, ...}
 */
export type PathToParamRecordMap<Path extends string, Route extends RouteNodeMap, Params extends ParamRecordMap = ParamRecordMap> = Path extends `_${infer Segment}/${infer Rest}` ? PathToParamRecordMap<Rest, Route[Segment]["children"] & {}, // shortcut to exclude undefined
RouteNodeToParamRecordMap<Route[Segment]>> : Path extends `${infer Segment}/${infer Rest}` ? PathToParamRecordMap<Rest, Route[Segment]["children"] & {}, // shortcut to exclude undefined
// shortcut to exclude undefined
Params & RouteNodeToParamRecordMap<Route[Segment]>> : Path extends `_${infer Segment}` ? RouteNodeToParamRecordMap<Route[Segment]> : Params & RouteNodeToParamRecordMap<Route[Path]>;
/**
 * ExtractRouteNodeMapByPath<
 *  "segement/segment",
 *  {segment: {..., children: {segment: {..., children: {segment: { ... }}}}}},
 * > => {segment: { ... }},
 */
export type ExtractRouteNodeMapByPath<Path extends string, Route extends RouteNodeMap> = Path extends `_${infer Segment}/${infer Rest}` ? ExtractRouteNodeMapByPath<Rest, Route[Segment]["children"] & {}> : Path extends `${infer Segment}/${infer Rest}` ? ExtractRouteNodeMapByPath<Rest, Route[Segment]["children"] & {}> : Path extends `_${infer Segment}` ? Route[Segment]["children"] & {} : Route[Path]["children"] & {};
export type RoutesContext<Routes extends RouteNodeMap> = {
    template: (path: ExtractPathSuggestions<Routes, true>) => string;
    render: <Path extends ExtractPathSuggestions<Routes>>(...args: [
        path: Path,
        params: A.Compute<ExcludeEmptyProperties<PathToParamRecordMap<Path, Routes>>>
    ] | []) => string;
    parseParams: <Path extends ExtractPathSuggestions<Routes>>(path: Path, params: Record<string, any>) => PathToParamRecordMap<Path, Routes>["path"];
    parseQuery: <Path extends ExtractPathSuggestions<Routes>>(path: Path, params: Record<string, any>) => PathToParamRecordMap<Path, Routes>["query"];
    bind: <Path extends ExtractPathSuggestions<Routes>>(path: Path, params: A.Compute<ExcludeEmptyProperties<PathToParamRecordMap<Path, Routes>>>) => RoutesContext<ExtractRouteNodeMapByPath<Path, Routes>>;
    from: <Path extends ExtractPathSuggestions<Routes>>(path: Path, location: string, params: A.Compute<ExcludeEmptyProperties<{
        path: Partial<PathToParamRecordMap<Path, Routes>["path"]>;
        query: Partial<PathToParamRecordMap<Path, Routes>["query"]>;
    }>>) => RoutesContext<ExtractRouteNodeMapByPath<Path, Routes>>;
    replace: <Path extends ExtractPathSuggestions<Routes>>(path: Path, location: string, params: A.Compute<ExcludeEmptyProperties<{
        path: Partial<PathToParamRecordMap<Path, Routes>["path"]>;
        query: Partial<PathToParamRecordMap<Path, Routes>["query"]>;
    }>>) => string;
};
export type CreateRoutes = <Routes extends RouteNodeMap>(routes: Routes, renderer?: Renderer, prevCtx?: RenderContext, prevParams?: ParamRecordMap<any>) => RoutesContext<Routes>;
export const createRoutes: CreateRoutes;

//# sourceMappingURL=index.d.ts.map
