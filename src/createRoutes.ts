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
  skippedNodes: RouteNode[]; // containes leading nodes that were skipped in a relative path
  nodes: RouteNode[];
  path: Exclude<RouteNode["path"], undefined>;
  query: Exclude<RouteNode["query"], undefined>;
  isRelative: boolean;
  rawParams: Record<string, string>;
  rawQuery: Record<string, string>;
  parsedParams: Record<string, unknown>;
  parsedQuery: Record<string, unknown>;
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
      withRawParams(params?.path),
      withRawQuery(params?.query),
      withParsedParams,
      withParsedQuery
    );

    return renderer.render(ctx);
  };

  const bind = (path: string, params: ParamRecordMap<any>) => {
    const ctx = pipe(
      createRenderContext(routeMap, path, parentContext),
      withRawParams(params.path),
      withRawQuery(params.query)
    );

    const pathChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};

    return createRoutes(pathChildren, renderer, ctx);
  };

  const template = (path: string) =>
    renderer.template(createRenderContext(routeMap, path));

  const parseParams = (
    path: string,
    params: Record<string, string> | string
  ) => {
    const ctx = pipe(
      createRenderContext(routeMap, path, parentContext),
      typeof params === "string"
        ? withRawParamsFromLocationPath(params)
        : withRawParams(params),
      withParsedParams
    );

    return ctx.parsedParams;
  };

  const parseQuery = (path: string, query: Record<string, string> | string) => {
    const ctx = pipe(
      createRenderContext(routeMap, path, parentContext),
      typeof query === "string"
        ? withRawQueryFromUrlSearch(query)
        : withRawQuery(query),
      withParsedQuery
    );

    return ctx.parsedQuery;
  };

  const from = (
    path: string,
    location: string,
    overrideParams: ParamRecordMap<Record<string, any>>
  ) => {
    const [locationPath, locationQuery] = location.split("?");
    const ctx = pipe(
      createRenderContext(routeMap, path, parentContext),
      withRawParamsFromLocationPath(locationPath),
      withRawQueryFromUrlSearch(locationQuery),
      withRawParams(overrideParams.path),
      withRawQuery(overrideParams.query)
    );

    const pathChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};

    return createRoutes(pathChildren, renderer, ctx);
  };

  // basically the same as the from method but returns rendered path with remaining segments appended
  // appends query string as well (if available)
  const replace = (
    path: string,
    location: string,
    overrideParams: ParamRecordMap<Record<string, any>>
  ) => {
    const [locationPath, locationQuery] = location.split("?");
    const ctx = pipe(
      createRenderContext(routeMap, path, parentContext),
      withRawParamsFromLocationPath(locationPath, true),
      withRawParams(overrideParams.path),
      withRawQueryFromUrlSearch(locationQuery, true),
      withRawQuery(overrideParams.query),
      withParsedParams,
      withParsedQuery
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
    path: [],
    query: [],
    isRelative: false,
    rawParams: {},
    rawQuery: {},
    parsedParams: {},
    parsedQuery: {},
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
      path: [],
      query: [],
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
      ctx.skippedNodes.push(nextNodeMap[nodeName]);
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

  return ctx;
};

const withRawParamsFromLocationPath =
  (locationPath: string = "", includeExtraPath: boolean = false) =>
  (ctx: RenderContext): RenderContext => {
    const remaining = locationPath
      .slice(locationPath[0] === "/" ? 1 : 0)
      .split("/");

    const rawParams: Record<string, any> = {};

    // keep track of recent optional params since they might contain path segments
    // if a path segment doesn't match the algorithm continues searching in this array
    const recentOptionalParams: string[] = [];

    ctx.path.forEach((segment) => {
      const locationPathSegment = remaining.shift();

      if (typeof segment === "string") {
        if (segment === locationPathSegment) {
          recentOptionalParams.length = 0; // irrelevant from here
        } else {
          // segment might have been swallowed by an optional param
          let recentParam: string | undefined;
          let foundMatch = false;
          while ((recentParam = recentOptionalParams.shift())) {
            if (rawParams[recentParam] === segment) {
              delete rawParams[recentParam];
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
        rawParams[segment.name] = locationPathSegment;
        if (segment.kind === "optional") {
          recentOptionalParams.push(segment.name);
        } else if (!locationPathSegment) {
          throw new Error(
            `"${locationPath}" doesn't match "${defaultRenderer.template(
              ctx
            )}", missing parameter "${segment.name}"`
          );
        } else {
          recentOptionalParams.length = 0;
        }
      }
    });

    return {
      ...ctx,
      rawParams,
      path: includeExtraPath ? ctx.path.concat(remaining) : ctx.path,
    };
  };

const withRawParams =
  (rawParams?: Record<string, string>) =>
  (ctx: RenderContext): RenderContext => ({
    ...ctx,
    rawParams: { ...ctx.rawParams, ...rawParams },
  });

const withParsedParams = (ctx: RenderContext): RenderContext => {
  const parsedParams: Record<string, any> = {};

  ctx.path.forEach((segment) => {
    if (typeof segment === "string") {
      return;
    }
    if (ctx.rawParams[segment.name]) {
      parsedParams[segment.name] = segment.parser.parse(
        ctx.rawParams[segment.name]
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
    parsedParams,
  };
};

const withRawQueryFromUrlSearch =
  (urlSearchParams: string = "", includeExtraQuery: boolean = false) =>
  (ctx: RenderContext): RenderContext => ({
    ...ctx,
    ...withRawQuery(
      Object.fromEntries(new URLSearchParams(urlSearchParams)),
      includeExtraQuery
    )(ctx),
  });

const withRawQuery =
  (queryParams?: Record<string, string>, includeExtraQuery: boolean = false) =>
  (ctx: RenderContext): RenderContext => {
    const remaining = { ...queryParams };
    const rawQuery: Record<string, string> = {};

    ctx.query.forEach(({ name }) => {
      if (name in remaining) {
        rawQuery[name] = remaining[name];
        delete remaining[name];
      }
    });

    return {
      ...ctx,
      rawQuery: {
        ...ctx.rawQuery,
        ...rawQuery,
        ...(includeExtraQuery ? remaining : undefined),
      },
      query: includeExtraQuery
        ? ctx.query.concat(
            Object.keys(remaining).map((name) => str(name).optional)
          )
        : ctx.query,
    };
  };

const withParsedQuery = (ctx: RenderContext): RenderContext => {
  const parsedQuery: Record<string, any> = {};

  ctx.query.forEach((segment) => {
    if (ctx.rawQuery[segment.name]) {
      parsedQuery[segment.name] = segment.parser.parse(
        ctx.rawQuery[segment.name]
      );
    } else if (segment.kind === "required") {
      throw Error(
        `required query parameter "${
          segment.name
        }" was not provided in "${defaultRenderer.template(ctx)}"`
      );
    }
  });

  return {
    ...ctx,
    parsedQuery: { ...ctx.parsedQuery, ...parsedQuery },
  };
};

const pipe = (
  initialCtx: RenderContext,
  ...fns: ((ctx: RenderContext) => RenderContext)[]
) => fns.reduce((ctx, fn) => fn(ctx), initialCtx);
