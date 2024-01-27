import {
  CreateRoutes,
  ParamRecordMap,
  RouteNode,
  RouteNodeMap,
  RoutesContext,
  defaultRenderer,
  str,
} from ".";

export type RenderContext = {
  skippedNodes: RouteNode[]; // contains leading nodes that were skipped in a relative path
  nodes: RouteNode[];
  pathSegments: Exclude<RouteNode["path"], undefined>;
  querySegments: Exclude<RouteNode["query"], undefined>;
  currentPathSegments: Exclude<RouteNode["path"], undefined>;
  currentQuerySegments: Exclude<RouteNode["query"], undefined>;
  isRelative: boolean;
  pathParams: Record<string, string>;
  queryParams: Record<string, string>;
};

export const createRoutes: CreateRoutes = (
  routeMap,
  renderer = defaultRenderer,
  parentContext
) => {
  const render = (
    path?: string,
    params?: ParamRecordMap<any>,
    context?: RenderContext
  ) => {
    const ctx = pipe(
      context ?? createRenderContext(routeMap, path, parentContext),
      addPathParams(params?.path),
      addQueryParams(params?.query)
    );

    return renderer.render(ctx);
  };

  const bind = (path: string, params: ParamRecordMap<any>) => {
    const ctx = pipe(
      createRenderContext(routeMap, path, parentContext),
      addPathParams(params.path),
      addQueryParams(params.query)
    );

    const pathChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};

    return createRoutes(pathChildren, renderer, ctx);
  };

  const template = (path: string) =>
    renderer.template(createRenderContext(routeMap, path));

  const parseParams = (
    path: string,
    paramsOrLocation: Record<string, string> | string
  ) =>
    parsePathParams(
      pipe(
        createRenderContext(routeMap, path, parentContext),
        typeof paramsOrLocation === "string"
          ? addPathParamsFromLocationPath(paramsOrLocation)
          : addRawPathParams(paramsOrLocation)
      )
    );

  const parseQuery = (path: string, query: Record<string, string> | string) =>
    parseQueryParams(
      pipe(
        createRenderContext(routeMap, path, parentContext),
        typeof query === "string"
          ? addQueryParamsFromUrlSearch(query)
          : addRawQueryParams(query)
      )
    );

  const from = (
    path: string,
    location: string,
    params?: ParamRecordMap<Record<string, unknown>>
  ) => {
    const [locationPath, locationQuery] = location.split("?");
    const ctx = pipe(
      createRenderContext(routeMap, path, parentContext),
      addPathParamsFromLocationPath(locationPath),
      addQueryParamsFromUrlSearch(locationQuery),
      overrideParams(params)
    );

    const pathChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};

    return createRoutes(pathChildren, renderer, ctx);
  };

  // basically the same as the from method but returns rendered path with remaining segments appended
  // appends query string as well (if available)
  const replace = (
    path: string,
    location: string,
    params: ParamRecordMap<Record<string, unknown>>
  ) => {
    const [locationPath, locationQuery] = location.split("?");
    const ctx = pipe(
      createRenderContext(routeMap, path, parentContext),
      addPathParamsFromLocationPath(locationPath, true),
      addQueryParamsFromUrlSearch(locationQuery, true),
      overrideParams(params)
    );

    return renderer.render(ctx);
  };

  return {
    render,
    bind,
    template,
    parseParams,
    parseQuery,
    from,
    replace,
  } as RoutesContext<any>;
};

const createRenderContext = (
  routeMap: RouteNodeMap,
  path?: string,
  parentCtx?: RenderContext
): RenderContext => {
  let ctx: RenderContext = parentCtx ?? {
    skippedNodes: [],
    nodes: [],
    pathSegments: [],
    querySegments: [],
    isRelative: false,
    currentPathSegments: [],
    currentQuerySegments: [],
    pathParams: {},
    queryParams: {},
  };

  if (!path) {
    return ctx;
  }

  const [absolutePath, relativePath] = path.split("/_");
  const isRelative = typeof relativePath === "string";

  if (isRelative) {
    ctx = {
      ...ctx,
      skippedNodes: ctx.skippedNodes.concat(ctx.nodes),
      nodes: [],
      pathSegments: [],
      querySegments: [],
      isRelative: true,
    };
  }

  let nextNodeMap: RouteNodeMap | undefined = routeMap;

  // skip leading segments in relative path
  if (isRelative) {
    absolutePath.split("/").forEach((nodeName) => {
      if (!nextNodeMap?.[nodeName]) {
        throw Error(`unknown path segment "${nodeName}" in ${path}`);
      }
      ctx = {
        ...ctx,
        skippedNodes: ctx.skippedNodes.concat(nextNodeMap[nodeName]),
      };
      nextNodeMap = nextNodeMap[nodeName].children;
    });
  }

  // resets current segments
  ctx = {
    ...ctx,
    currentPathSegments: [],
    currentQuerySegments: [],
  };

  (relativePath ?? absolutePath).split("/").forEach((nodeName, i) => {
    if (!nextNodeMap) {
      throw Error(`unknown segment ${nodeName}`);
    }

    const nextNode = nextNodeMap[nodeName];
    ctx = {
      ...ctx,
      nodes: ctx.nodes.concat(nextNode),
      pathSegments: ctx.pathSegments.concat(
        nextNode.path ?? (nextNode.template ? [nextNode.template] : [])
      ),
      querySegments: ctx.querySegments.concat(nextNode.query ?? []),
      currentPathSegments: ctx.currentPathSegments.concat(nextNode.path ?? []),
      currentQuerySegments: ctx.currentQuerySegments.concat(
        nextNode.query ?? []
      ),
    };
    nextNodeMap = nextNode.children;
  });

  return ctx;
};

const addPathParamsFromLocationPath =
  (locationPath: string = "", includeExtraPath: boolean = false) =>
  (ctx: RenderContext): RenderContext => {
    const remaining = locationPath
      .slice(locationPath[0] === "/" ? 1 : 0)
      .split("/");

    const pathParams: Record<string, string> = {};

    // keep track of recent optional params since they might contain path segments
    // if a path segment doesn't match the algorithm continues searching in this array
    const recentOptionalParams: string[] = [];

    ctx.currentPathSegments.forEach((segment) => {
      const locationPathSegment = remaining.shift();

      if (typeof segment === "string") {
        if (segment === locationPathSegment) {
          recentOptionalParams.length = 0; // irrelevant from here
        } else {
          // segment might have been swallowed by an optional param
          let recentParam: string | undefined;
          let foundMatch = false;
          while ((recentParam = recentOptionalParams.shift())) {
            if (pathParams[recentParam] === segment) {
              delete pathParams[recentParam];
              // hold segment back for the next iteration
              locationPathSegment && remaining.unshift(locationPathSegment);
              foundMatch = true;
            }
          }
          if (!foundMatch) {
            throw new Error(
              `"${locationPath}" doesn't match "${defaultRenderer.template(
                ctx
              )}", missing segment "${segment}"`
            );
          }
        }
      } else {
        if (locationPathSegment != null) {
          pathParams[segment.name] = locationPathSegment;
          if (segment.kind === "optional") {
            recentOptionalParams.push(segment.name);
          } else {
            recentOptionalParams.length = 0;
          }
        } else if (segment.kind === "required") {
          throw new Error(
            `"${locationPath}" doesn't match "${defaultRenderer.template(
              ctx
            )}", missing parameter "${segment.name}"`
          );
        }
      }
    });

    return {
      ...ctx,
      pathParams: { ...ctx.pathParams, ...pathParams },
      pathSegments: includeExtraPath
        ? ctx.pathSegments.concat(remaining)
        : ctx.pathSegments,
    };
  };

const addPathParams =
  (params?: Record<string, unknown>) =>
  (ctx: RenderContext): RenderContext => {
    if (!params) return ctx;

    const pathParams: Record<string, string> = {};

    ctx.currentPathSegments.forEach((segment) => {
      if (typeof segment === "string") {
      } else if (params[segment.name] != null) {
        pathParams[segment.name] = segment.parser.serialize(
          params[segment.name]
        );
      } else if (segment.kind === "required") {
        throw Error(
          `required path parameter "${
            segment.name
          }" was not provided in "${defaultRenderer.template(ctx)}"`
        );
      }
    });

    return {
      ...ctx,
      pathParams: { ...ctx.pathParams, ...pathParams },
    };
  };

const addRawPathParams =
  (params?: Record<string, string>) =>
  (ctx: RenderContext): RenderContext => ({
    ...ctx,
    pathParams: { ...ctx.pathParams, ...params },
  });

const parsePathParams = (ctx: RenderContext): Record<string, unknown> => {
  const parsedParams: Record<string, any> = {};

  ctx.pathSegments.forEach((segment) => {
    if (typeof segment === "string") {
    } else if (ctx.pathParams[segment.name] != null) {
      parsedParams[segment.name] = segment.parser.parse(
        ctx.pathParams[segment.name]
      );
    } else if (segment.kind === "required") {
      throw Error(
        `parsePathParams: required path parameter "${
          segment.name
        }" was not provided in "${defaultRenderer.template(ctx)}"`
      );
    }
  });

  return parsedParams;
};

const addQueryParamsFromUrlSearch =
  (urlSearchParams: string = "", includeExtraQuery: boolean = false) =>
  (ctx: RenderContext): RenderContext => ({
    ...ctx,
    ...addQueryParams(
      Object.fromEntries(new URLSearchParams(urlSearchParams)),
      includeExtraQuery
    )(ctx),
  });

const addQueryParams =
  (source?: Record<string, unknown>, includeExtraQuery: boolean = false) =>
  (ctx: RenderContext): RenderContext => {
    const remaining = { ...source };
    const queryParams: Record<string, string> = {};

    ctx.currentQuerySegments.forEach(({ name, parser, kind }) => {
      if (remaining[name] != null) {
        queryParams[name] = parser.serialize(remaining[name]);
        delete remaining[name];
      } else if (kind === "required") {
        throw Error(
          `parsePathParams: required path parameter "${name}" was not provided in "${defaultRenderer.template(
            ctx
          )}"`
        );
      }
    });

    return {
      ...ctx,
      queryParams: {
        ...ctx.queryParams,
        ...queryParams,
        ...(includeExtraQuery
          ? (remaining as Record<string, string>)
          : undefined),
      },
      querySegments: includeExtraQuery
        ? ctx.querySegments.concat(
            Object.keys(remaining).map((name) => str(name).optional)
          )
        : ctx.querySegments,
    };
  };

const addRawQueryParams =
  (params?: Record<string, string>) =>
  (ctx: RenderContext): RenderContext => ({
    ...ctx,
    queryParams: { ...ctx.queryParams, ...params },
  });

const parseQueryParams = (ctx: RenderContext): Record<string, unknown> => {
  const parsedQuery: Record<string, any> = {};

  ctx.querySegments.forEach((segment) => {
    const value = ctx.queryParams[segment.name];
    if (value != null) {
      parsedQuery[segment.name] = segment.parser.parse(value);
    } else if (segment.kind === "required") {
      throw Error(
        `parseQueryParams: required query parameter "${
          segment.name
        }" was not provided in "${defaultRenderer.template(ctx)}"`
      );
    }
  });

  return parsedQuery;
};

const overrideParams =
  (params?: ParamRecordMap<Record<string, unknown>>) =>
  (ctx: RenderContext): RenderContext => {
    const pathParams = { ...ctx.pathParams };
    if (params?.path) {
      ctx.currentPathSegments.forEach((segment) => {
        if (typeof segment !== "string" && segment.name in params.path) {
          if (params.path[segment.name] != null) {
            pathParams[segment.name] = segment.parser.serialize(
              params.path[segment.name]
            );
          } else if (segment.kind === "optional") {
            delete pathParams[segment.name];
          } else {
            throw Error(
              `overrideParams: required path parameter "${
                segment.name
              }" can not be removed from "${defaultRenderer.template(ctx)}"`
            );
          }
        }
      });
    }

    const queryParams = { ...ctx.queryParams };
    if (params?.query) {
      ctx.currentQuerySegments.forEach(({ name, kind, parser }) => {
        if (name in params.query) {
          if (params.query[name] != null) {
            queryParams[name] = parser.serialize(params.query[name]);
          } else if (kind === "optional") {
            delete queryParams[name];
          } else {
            throw Error(
              `overrideParams: required query parameter "${name}" can not be removed from "${defaultRenderer.template(
                ctx
              )}"`
            );
          }
        }
      });
    }

    return {
      ...ctx,
      pathParams,
      queryParams,
    };
  };

const pipe = (
  initialCtx: RenderContext,
  ...fns: ((ctx: RenderContext) => RenderContext)[]
) => fns.reduce((ctx, fn) => fn(ctx), initialCtx);
