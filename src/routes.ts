import { match } from "path-to-regexp";
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
 *  | "childA/childB"
 *  | "childA/_childB"
 */
export type ExtractPaths<
  T extends RouteNodeMap,
  IsTemplate = false,
  IsAbsolute = true
> = {
  // K = NodeName
  [K in keyof T]: K extends string // filters out symbol and number
    ? T[K]["children"] extends object // has children
      ?
          | K
          | `${K}/${ExtractPaths<T[K]["children"], IsTemplate>}`
          | If<
              IsAbsolute,
              `${K}/_${ExtractPaths<T[K]["children"], IsTemplate, false>}`
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
    ...args:
      | [
          path: Path,
          params: ExcludeEmptyProperties<PathToParamRecordMap<Path, Routes>>
        ]
      | []
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
    params: DeepPartial<
      ExcludeEmptyProperties<PathToParamRecordMap<Path, Routes>>
    > &
      ExcludeEmptyProperties<Pick<PathToParamRecordMap<Path, Routes>, "query">> // query params can't be extracted from path:
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
    const ctx = prepareContext(routeMap, path);
    return rndrr.template(ctx);
  };

  const render = (path?: string, params?: ParamRecordMap<any>) => {
    const ctx = prepareContext(routeMap, path, prevSegments);

    return rndrr.render(ctx, {
      path: { ...prevParams.path, ...params?.path },
      query: { ...prevParams.query, ...params?.query },
    });
  };

  const bind = (path: string, params: ParamRecordMap<any>) => {
    const ctx = prepareContext(routeMap, path, prevSegments);

    const currSegmentChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};

    return createRoutes(currSegmentChildren, renderer, ctx, {
      path: { ...prevParams.path, ...params.path },
      query: { ...prevParams.query, ...params.query },
    });
  };

  const params = (path: string, params: Record<string, string>) => {
    const parsedParams: Record<string, any> = {};
    const ctx = prepareContext(routeMap, path);

    ctx.path.forEach((segment) => {
      if (typeof segment === "string") {
        return;
      }
      if (params[segment.name]) {
        parsedParams[segment.name] = segment.parser.parse(params[segment.name]);
      } else if (segment.kind === "required") {
        throw Error(`required path parameter `);
      }
    });

    return parsedParams;
  };

  const query = (path: string, params: Record<string, string>) => {
    const parsedParams: Record<string, any> = {};
    const ctx = prepareContext(routeMap, path);

    ctx.query.forEach((segment) => {
      if (params[segment.name]) {
        parsedParams[segment.name] = segment.parser.parse(params[segment.name]);
      } else if (segment.kind === "required") {
        throw Error(`required path parameter `);
      }
    });

    return parsedParams;
  };

  const from = (
    path: string,
    locationPathname: string,
    paramMap: ParamRecordMap<Record<string, any>>
  ) => {
    // build context from path
    const ctx = prepareContext(routeMap, path);
    const template = defaultRenderer(routeMap).template(ctx);
    const result = match(template, { decode: decodeURIComponent })(
      locationPathname
    );

    if (!result) {
      throw new Error(
        `location pathname "${locationPathname}" doesn't match the template ${template} (created from path "${path}")`
      );
    }

    const lastNodeChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};

    return createRoutes(lastNodeChildren, renderer, ctx, {
      path: { ...prevParams.path, ...result.params, ...paramMap.path },
      query: { ...prevParams.query, ...paramMap.query },
    });
  };

  return {
    template,
    bind,
    render,
    params,
    query,
    from,
  } as RoutesContext<any>;
};

const prepareContext = (
  routeMap: RouteNodeMap,
  path?: string,
  parentCtx?: RenderContext
): RenderContext => {
  const ctx: RenderContext = parentCtx ?? {
    skippedNodes: [],
    nodes: [],
    path: [],
    query: [],
    isRelative: false,
  };

  if (!path) {
    return ctx;
  }

  const [absolutePath, relativePath] = path.split("/_");
  const isRelative = typeof relativePath === "string";

  if (isRelative) {
    ctx.skippedNodes = ctx.skippedNodes.concat(ctx.nodes);
    ctx.nodes = [];
    ctx.path = [];
    ctx.query = [];
    ctx.isRelative = true;
  }

  let nextNodeMap: RouteNodeMap | undefined = routeMap;

  // skip leading segments in relative path
  if (isRelative) {
    absolutePath.split("/").forEach((nodeName) => {
      if (!nextNodeMap?.[nodeName]) {
        throw Error(`unknown path segment "${nodeName}" in ${path}`);
      }
      ctx.skippedNodes.push(nextNodeMap);
      nextNodeMap = nextNodeMap[nodeName].children;
    });
  }

  (relativePath ?? absolutePath).split("/").forEach((nodeName, i) => {
    if (!nextNodeMap) {
      throw Error(`unknown segment ${nodeName}`);
    }

    const nextNode = nextNodeMap[nodeName];
    ctx.nodes.push(nextNode);
    ctx.path.push(
      ...(nextNode.path ?? (nextNode.template ? [nextNode.template] : []))
    );
    ctx.query.push(...(nextNode.query ?? []));
    nextNodeMap = nextNode.children;
  });

  // extract  path segments and query params and determine if path is relative
  return ctx;
};
