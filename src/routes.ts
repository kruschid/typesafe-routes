import { AnyParam } from "./param";
import { RenderContext, Renderer, defaultRenderer } from "./renderer";

type If<Condition, Then> = Condition extends true ? Then : never;
type Unwrap<T> = T extends unknown[] ? T[number] : never;
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

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
 * ExtractPaths<{
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
 *  | "childA/*"
 *  | "childA/childB"
 *  | "childA/_childB"
 */
export type ExtractPaths<
  T extends RouteNodeMap,
  IsTemplate = false,
  IsAbsolute = true
> = {
  [K in keyof T]: K extends string // filters out symbol and number
    ? T[K]["children"] extends object // has children
      ?
          | K
          | `${K}/${ExtractPaths<T[K]["children"], IsTemplate>}`
          | If<IsTemplate, `${K}/*`>
          | If<
              IsAbsolute,
              `${K}/_${ExtractPaths<T[K]["children"], IsTemplate, false>}`
            >
      : K // no children
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
 * PathToRouteNodeMap<
 *  "segement/segment",
 *  {segment: {..., children: {segment: {..., children: {segment: { ... }}}}}},
 * > => {segment: { ... }},
 */
export type PathToRouteNodeMap<
  Path extends string,
  Route extends RouteNodeMap
> = Path extends `_${infer Segment}/${infer Rest}` // partial route segment (drop all previous options)
  ? PathToRouteNodeMap<
      Rest,
      Route[Segment]["children"] & {} // shortcut to exclude undefined
    >
  : Path extends `${infer Segment}/${infer Rest}` // regular segment (concat options)
  ? PathToRouteNodeMap<
      Rest,
      Route[Segment]["children"] & {} // shortcut to exclude undefined
    >
  : Path extends `_${infer Segment}` // partial route in the final segment (drop previous options and discontinue)
  ? Route[Segment]["children"] & {}
  : Route[Path]["children"] & {};

export type RoutesContext<Routes extends RouteNodeMap> = {
  template: (path: ExtractPaths<Routes, true>) => string;
  render: <Path extends ExtractPaths<Routes>>(
    path: Path,
    params: ExcludeEmptyProperties<PathToParamRecordMap<Path, Routes>>
  ) => string;
  params: <Path extends ExtractPaths<Routes>>(
    path: Path,
    params: Record<string, any>
  ) => PathToParamRecordMap<Path, Routes>["path"];
  query: <Path extends ExtractPaths<Routes>>(
    path: Path,
    params: Record<string, any>
  ) => PathToParamRecordMap<Path, Routes>["query"];
  bind: <Path extends ExtractPaths<Routes>>(
    path: Path,
    params: ExcludeEmptyProperties<PathToParamRecordMap<Path, Routes>>
  ) => RoutesContext<PathToRouteNodeMap<Path, Routes>>;
  from: <Path extends ExtractPaths<Routes>>(
    path: Path,
    url: string,
    override?: DeepPartial<
      ExcludeEmptyProperties<PathToParamRecordMap<Path, Routes>>
    >
  ) => RoutesContext<PathToRouteNodeMap<Path, Routes>>;
};

type RoutesFn = <Routes extends RouteNodeMap>(
  routes: Routes,
  renderer?: Renderer,
  prevCtx?: RenderContext,
  prevParams?: ParamRecordMap<any>
) => RoutesContext<Routes>;

export const createRoutes: RoutesFn = (
  routeMap,
  renderer = defaultRenderer,
  prevSegments,
  prevParams = { path: {}, query: {} }
) => {
  const rndrr = renderer(routeMap);

  const template = (path: string) => {
    const ctx = pickSegments(routeMap, path);
    return rndrr.template(ctx, path);
  };

  const render = (path: string, params: ParamRecordMap<any>) => {
    const ctx = pickSegments(routeMap, path, prevSegments);

    return rndrr.render(ctx, path, {
      path: { ...prevParams.path, ...params.path },
      query: { ...prevParams.query, ...params.query },
    });
  };

  const bind = (path: string, params: ParamRecordMap<any>) => {
    const ctx = pickSegments(routeMap, path, prevSegments);

    const currSegment = ctx.segments[ctx.segments.length - 1];

    if (!currSegment.children) {
      throw Error("can't apply bind on childless segment");
    }

    return createRoutes(currSegment.children, renderer, ctx, {
      path: { ...prevParams.path, ...params.path },
      query: { ...prevParams.query, ...params.query },
    });
  };

  return {
    template,
    bind,
    render,
    params: null as any,
    query: null as any,
    from: null as any,
  } as RoutesContext<any>;
};

const pickSegments = (
  routeMap: RouteNodeMap,
  path: string,
  prevContext?: RenderContext
): RenderContext => {
  let nextSegment: RouteNodeMap | undefined = routeMap;
  const [absolutePath, relativePath] = path.split("/_");
  const isRelative = typeof relativePath === "string";

  const ctx: RenderContext = {
    segments: (isRelative ? [] : prevContext?.segments) ?? [],
    skippedSegments: prevContext?.skippedSegments ?? [],
    isRelative: isRelative || (prevContext?.isRelative ?? false),
    hasWildcard: false,
  };

  // skip leading segments in relative path
  if (isRelative) {
    absolutePath.split("/").forEach((segmentName) => {
      if (!nextSegment?.[segmentName]) {
        throw Error(`unknown path segment "${segmentName}" in ${path}`);
      }
      ctx.skippedSegments.push(nextSegment);
      nextSegment = nextSegment[segmentName].children;
    });
  }

  (relativePath ?? absolutePath).split("/").forEach((segmentName, i) => {
    if (!nextSegment) {
      throw Error(`unknown segment ${segmentName}`);
    }

    // template wildcard segment
    if (segmentName === "*") {
      ctx.hasWildcard = true;
      return;
    }

    ctx.segments.push(nextSegment[segmentName]);
    nextSegment = nextSegment[segmentName].children;
  });

  // extract  path segments and query params and determine if path is relative
  return ctx;
};
