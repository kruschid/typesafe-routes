import { AnyParam } from "./param";
import { RenderContext, Renderer, defaultRenderer } from "./renderer";

type If<Condition, Then> = Condition extends true ? Then : never;
type Unwrap<T> = T extends unknown[] ? T[number] : never;
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type RouteSegment = {
  path?: (string | AnyParam)[];
  query?: AnyParam[];
  children?: RouteMap;
};
export type RouteMap = Record<string, RouteSegment>;

/**
 * SegmentToParamMap<{
 *  path?: (string | Param<TName TValue>)[];
 *  query?: Param<TName TValue>[];
 *  children?: RouteMap;
 * }> => {
 *  path: {[TName]: TValue, ...},
 *  query: {[TName]: TValue, ...}
 * }
 */
export type SegmentToParamMap<T extends RouteSegment> = {
  path: ToParamsRecord<Exclude<Unwrap<T["path"]>, string | undefined>>;
  query: ToParamsRecord<Exclude<Unwrap<T["query"]>, undefined>>;
};
type ParamMap = Record<"path" | "query", unknown>;

/**
 * ToParamsRecord<{
 *  kind: "required" | "optional";
 *  name: TName;
 *  parser: Parser<TParseType>
 * } | {...}> => {
 *  [TName]: TParseType,
 *  [TName]?: TParseType,
 *  ...
 * }
 */
export type ToParamsRecord<Params extends AnyParam> = {
  [K in Extract<Params, { kind: "required" }>["name"]]: ReturnType<
    Extract<Params, { name: K }>["parser"]["parse"]
  >;
} & {
  [K in Extract<Params, { kind: "optional" }>["name"]]?: ReturnType<
    Extract<Params, { name: K }>["parser"]["parse"]
  >;
};

/**
 * RoutePath<{
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
export type PathSegment<
  T extends RouteMap,
  IsTemplate = false,
  IsAbsolute = true
> = {
  [K in keyof T]: K extends string // filters out symbol and number
    ? T[K]["children"] extends object // has children
      ?
          | K
          | `${K}/${PathSegment<T[K]["children"], IsTemplate>}`
          | If<IsTemplate, `${K}/*`>
          | If<
              IsAbsolute,
              `${K}/_${PathSegment<T[K]["children"], IsTemplate, false>}`
            >
      : K // no children
    : never;
}[keyof T];

/**
 * PathToParamMap<
 *  "segement/segment/segment",
 *  {segment: {..., children: {segment: {..., children: {segment}}}}},
 *  {path: {...}, query: {...}}
 * > => { param: type, ...}
 */
export type PathToParamMap<
  Path extends string,
  Route extends RouteMap,
  Params extends ParamMap = ParamMap
> = Path extends `_${infer Segment}/${infer Rest}` // partial route segment (drop all previous options)
  ? PathToParamMap<
      Rest,
      Route[Segment]["children"] & {}, // shortcut to exclude undefined
      SegmentToParamMap<Route[Segment]>
    >
  : Path extends `${infer Segment}/${infer Rest}` // regular segment (concat options)
  ? PathToParamMap<
      Rest,
      Route[Segment]["children"] & {}, // shortcut to exclude undefined
      Params & SegmentToParamMap<Route[Segment]>
    >
  : Path extends `_${infer Segment}` // partial route in the final segment (drop previous options and discontinue)
  ? SegmentToParamMap<Route[Segment]>
  : Params & SegmentToParamMap<Route[Path]>;

/**
 * DeepFindParamMap<
 *  "segement/segment",
 *  {segment: {..., children: {segment: {..., children: {segment: { ... }}}}}},
 * > => {segment: { ... }},
 */
export type DeepFindParamMap<
  Path extends string,
  Route extends RouteMap
> = Path extends `_${infer Segment}/${infer Rest}` // partial route segment (drop all previous options)
  ? DeepFindParamMap<
      Rest,
      Route[Segment]["children"] & {} // shortcut to exclude undefined
    >
  : Path extends `${infer Segment}/${infer Rest}` // regular segment (concat options)
  ? DeepFindParamMap<
      Rest,
      Route[Segment]["children"] & {} // shortcut to exclude undefined
    >
  : Path extends `_${infer Segment}` // partial route in the final segment (drop previous options and discontinue)
  ? Route[Segment]["children"] & {}
  : Route[Path]["children"] & {};

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

export type RoutesContext<Routes extends RouteMap> = {
  template: (path: PathSegment<Routes, true>) => string;
  render: <Path extends PathSegment<Routes>>(
    path: Path,
    params: ExcludeEmptyProperties<PathToParamMap<Path, Routes>>
  ) => string;
  params: <Path extends PathSegment<Routes>>(
    path: Path,
    params: Record<string, any>
  ) => PathToParamMap<Path, Routes>["path"];
  query: <Path extends PathSegment<Routes>>(
    path: Path,
    params: Record<string, any>
  ) => PathToParamMap<Path, Routes>["query"];
  bind: <Path extends PathSegment<Routes>>(
    path: Path,
    params: ExcludeEmptyProperties<PathToParamMap<Path, Routes>>
  ) => RoutesContext<DeepFindParamMap<Path, Routes>>;
  from: <Path extends PathSegment<Routes>>(
    path: Path,
    url: string,
    override?: DeepPartial<ExcludeEmptyProperties<PathToParamMap<Path, Routes>>>
  ) => RoutesContext<DeepFindParamMap<Path, Routes>>;
};

type RoutesFn = <Routes extends RouteMap>(
  routes: Routes,
  renderer?: Renderer,
  prevSegments?: RenderContext
) => RoutesContext<Routes>;

export const createRoutes: RoutesFn = (
  routeMap,
  renderer = defaultRenderer,
  prevSegments
) => {
  const rndrr = renderer(routeMap);

  const template = (path: string) => {
    const ctx = toRenderContext(routeMap, path);
    return rndrr.template(ctx, path);
  };

  const render = (path: string, params: SegmentToParamMap<RouteSegment>) => {
    const ctx = toRenderContext(routeMap, path, params, prevSegments);
    return rndrr.render(ctx, path);
  };

  const bind = (path: string, params: SegmentToParamMap<RouteSegment>) => {
    const ctx = toRenderContext(routeMap, path, params, prevSegments);

    const currSegment = ctx.segments[ctx.segments.length - 1];

    if (!currSegment.children) {
      throw Error("can't apply bind on childless segment");
    }

    return createRoutes(currSegment.children, renderer, ctx);
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

const toRenderContext = (
  routeMap: RouteMap,
  path: string,
  params?: SegmentToParamMap<RouteSegment>,
  prevContext?: RenderContext
): RenderContext => {
  let nextSegment: RouteMap | undefined = routeMap;
  const [absolutePath, relativePath] = path.split("/_");
  const isRelative = typeof relativePath === "string";

  // skip leading segments in relative mode
  if (isRelative) {
    absolutePath.split("/").forEach((segmentName) => {
      if (!nextSegment?.[segmentName]) {
        throw Error(`unknown path segment "${segmentName}" in ${path}`);
      }
      nextSegment = nextSegment[segmentName].children;
    });
  }
  const ctx: RenderContext = {
    path: [],
    query: {},
    segments: [],
    ...(isRelative ? {} : prevContext),
    isRelative: isRelative || (prevContext?.isRelative ?? false),
  };

  (relativePath ?? absolutePath).split("/").forEach((segmentName, i) => {
    if (!nextSegment) {
      throw Error(`unknown segment ${segmentName}`);
    }

    // stop if star segment was discovered in a template
    if (segmentName === "*") {
      ctx.hasChildren = true;
      return;
    }

    const currSegment = nextSegment[segmentName];

    nextSegment = currSegment.children;

    ctx.segments.push(currSegment);

    // stop here if building context for a template
    if (!params) {
      return;
    }

    currSegment.path?.forEach((pathSegment) => {
      if (typeof pathSegment === "string") {
        ctx.path.push(pathSegment);
      } else if (
        pathSegment.kind === "required" &&
        !params.path[pathSegment.name]
      ) {
        throw Error(
          `required path parameter ${pathSegment.name} was not specified`
        );
      } else if (params.path[pathSegment.name]) {
        ctx.path.push(
          pathSegment.parser.serialize(params.path[pathSegment.name])
        );
      }
    }) ?? [];

    currSegment.query?.forEach((queryParam) => {
      if (queryParam.kind === "required" && !params.query[queryParam.name]) {
        throw Error(
          `required query parameter ${queryParam.name} was not specified`
        );
      }
      ctx.query[queryParam.name] = queryParam.parser.serialize(
        params.query[queryParam.name]
      );
    }) ?? [];
  });

  // extract  path segments and query params and determine if path is relative
  return ctx;
};
