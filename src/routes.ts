import { defaultContext } from "./context";
import { str } from "./params";
import type {
  AnyRenderContext,
  CreateRoutes,
  ParamRecordMap,
  RouteNodeMap,
} from "./types";

export const createRoutes: CreateRoutes = (
  routeMap,
  context?: AnyRenderContext
) => {
  const props = (path: string[]) => ({
    $routes: routeMap,
    $context: context ?? defaultContext,
    $template: () =>
      (context?.renderTemplate ?? defaultContext.renderTemplate)(
        createRenderContext(routeMap, path)
      ),
    $render: (params: ParamRecordMap<any>) => {
      const ctx = pipe(
        createRenderContext(routeMap, path, context),
        addPathParams(params.path),
        addQueryParams(params.query)
      );

      return (context?.renderPath ?? defaultContext.renderPath)(ctx);
    },
    $bind: (params: ParamRecordMap<any>) => {
      const ctx = pipe(
        createRenderContext(routeMap, path, context),
        addPathParams(params.path),
        addQueryParams(params.query)
      );

      const pathChildren = ctx.nodes.slice(-1)[0]?.children ?? {};

      return createRoutes(pathChildren, ctx);
    },
    $parseParams: (paramsOrLocation: Record<string, string> | string) =>
      parsePathParams(
        pipe(
          createRenderContext(routeMap, path, context),
          typeof paramsOrLocation === "string"
            ? addPathParamsFromLocationPath(paramsOrLocation)
            : addRawPathParams(paramsOrLocation)
        )
      ),
    $parseQuery: (query: Record<string, string> | string) =>
      parseQueryParams(
        pipe(
          createRenderContext(routeMap, path, context),
          typeof query === "string"
            ? addQueryParamsFromUrlSearch(query)
            : addRawQueryParams(query)
        )
      ),
    $from: (
      location: string,
      params?: ParamRecordMap<Record<string, unknown>>
    ) => {
      const [locationPath, locationQuery] = location.split("?");
      const ctx = pipe(
        createRenderContext(routeMap, path, context),
        addPathParamsFromLocationPath(locationPath),
        addQueryParamsFromUrlSearch(locationQuery),
        overrideParams(params)
      );

      const pathChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};

      return createRoutes(pathChildren, ctx);
    },
    // similar to the $from method but returns rendered path with remaining segments appended
    // appends query string as well (if available)
    $replace: (
      location: string,
      params: ParamRecordMap<Record<string, unknown>>
    ) => {
      const [locationPath, locationQuery] = location.split("?");
      const ctx = pipe(
        createRenderContext(routeMap, path, context),
        addPathParamsFromLocationPath(locationPath, true),
        addQueryParamsFromUrlSearch(locationQuery, true),
        overrideParams(params)
      );

      return (context?.renderPath ?? defaultContext.renderPath)(ctx);
    },
  });

  const proxy = (path: string[]): any =>
    new Proxy(props(path), {
      get: (target, maybeSegment, receiver) =>
        typeof maybeSegment === "string" && maybeSegment[0] !== "$"
          ? proxy([...path, maybeSegment]) // add segment to path
          : Reflect.get(target, maybeSegment, receiver),
    });

  return proxy([]);
};

const createRenderContext = (
  routeMap: RouteNodeMap,
  path: string[],
  context?: AnyRenderContext
): AnyRenderContext => {
  let ctx: AnyRenderContext = context
    ? {
        ...context,
        // don't inherit currentSegments from parent context
        currentPathSegments: [],
        currentQuerySegments: [],
      }
    : defaultContext;

  if (path.length <= 0) {
    return ctx;
  }

  let nextNodeMap: RouteNodeMap | undefined = routeMap;

  path.forEach((nodeName) => {
    if (nodeName === "_") {
      // reset context
      ctx = {
        ...ctx,
        skippedNodes: ctx.skippedNodes.concat(ctx.nodes),
        nodes: [],
        pathSegments: [],
        querySegments: [],
        currentPathSegments: [],
        currentQuerySegments: [],
        isRelative: true,
      };
    } else if (!nextNodeMap) {
      throw Error(`unknown segment ${nodeName} in ${path}`);
    } else {
      const nextNode = nextNodeMap[nodeName];
      ctx = {
        ...ctx,
        nodes: ctx.nodes.concat(nextNode),
        pathSegments: ctx.pathSegments.concat(
          nextNode.path ?? (nextNode.template ? [nextNode.template] : [])
        ),
        querySegments: ctx.querySegments.concat(nextNode.query ?? []),
        currentPathSegments: ctx.currentPathSegments.concat(
          nextNode.path ?? []
        ),
        currentQuerySegments: ctx.currentQuerySegments.concat(
          nextNode.query ?? []
        ),
      };
      nextNodeMap = nextNode.children;
    }
  });

  return ctx;
};

const addPathParamsFromLocationPath =
  (locationPath: string = "", includeExtraPath: boolean = false) =>
  (ctx: AnyRenderContext): AnyRenderContext => {
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
              `"${locationPath}" doesn't match "${defaultContext.renderTemplate(
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
            `"${locationPath}" doesn't match "${defaultContext.renderTemplate(
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
  (ctx: AnyRenderContext): AnyRenderContext => {
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
          }" was not provided in "${defaultContext.renderTemplate(ctx)}"`
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
  (ctx: AnyRenderContext): AnyRenderContext => ({
    ...ctx,
    pathParams: { ...ctx.pathParams, ...params },
  });

const parsePathParams = (ctx: AnyRenderContext): Record<string, unknown> => {
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
        }" was not provided in "${defaultContext.renderTemplate(ctx)}"`
      );
    }
  });

  return parsedParams;
};

const addQueryParamsFromUrlSearch =
  (urlSearchParams: string = "", includeExtraQuery: boolean = false) =>
  (ctx: AnyRenderContext): AnyRenderContext => ({
    ...ctx,
    ...addQueryParams(
      Object.fromEntries(new URLSearchParams(urlSearchParams)),
      includeExtraQuery
    )(ctx),
  });

const addQueryParams =
  (source?: Record<string, unknown>, includeExtraQuery: boolean = false) =>
  (ctx: AnyRenderContext): AnyRenderContext => {
    const remaining = { ...source };
    const queryParams: Record<string, string> = {};

    ctx.currentQuerySegments.forEach(({ name, parser, kind }) => {
      if (remaining[name] != null) {
        queryParams[name] = parser.serialize(remaining[name]);
        delete remaining[name];
      } else if (kind === "required") {
        throw Error(
          `addQueryParams: required path parameter "${name}" was not provided in "${defaultContext.renderTemplate(
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
            Object.keys(remaining).map((name) => str.optional(name))
          )
        : ctx.querySegments,
    };
  };

const addRawQueryParams =
  (params?: Record<string, string>) =>
  (ctx: AnyRenderContext): AnyRenderContext => ({
    ...ctx,
    queryParams: { ...ctx.queryParams, ...params },
  });

const parseQueryParams = (ctx: AnyRenderContext): Record<string, unknown> => {
  const parsedQuery: Record<string, any> = {};

  ctx.querySegments.forEach((segment) => {
    const value = ctx.queryParams[segment.name];
    if (value != null) {
      parsedQuery[segment.name] = segment.parser.parse(value);
    } else if (segment.kind === "required") {
      throw Error(
        `parseQueryParams: required query parameter "${
          segment.name
        }" was not provided in "${defaultContext.renderTemplate(ctx)}"`
      );
    }
  });

  return parsedQuery;
};

const overrideParams =
  (params?: ParamRecordMap<Record<string, unknown>>) =>
  (ctx: AnyRenderContext): AnyRenderContext => {
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
              }" can not be removed from "${defaultContext.renderTemplate(
                ctx
              )}"`
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
              `overrideParams: required query parameter "${name}" can not be removed from "${defaultContext.renderTemplate(
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
  initialCtx: AnyRenderContext,
  ...fns: ((ctx: AnyRenderContext) => AnyRenderContext)[]
) => fns.reduce((ctx, fn) => fn(ctx), initialCtx);
