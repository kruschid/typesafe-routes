import {
  AnyParam,
  CreateRoutes,
  ParamRecordMap,
  RenderContext,
  RouteNodeMap,
  RoutesContext,
  defaultRenderer,
  str,
} from ".";

export const createRoutes: CreateRoutes = (
  routeMap,
  renderer = defaultRenderer,
  prevSegments,
  prevParams = { path: {}, query: {} }
) => {
  const template = (path: string) => {
    const ctx = compilePath(routeMap, path);
    return renderer.template(ctx);
  };

  const render = (
    path?: string,
    params?: ParamRecordMap<any>,
    context?: RenderContext
  ) => {
    const ctx = context ?? compilePath(routeMap, path, prevSegments);

    return renderer.render(ctx, mergeParams(prevParams, params));
  };

  const bind = (path: string, params: ParamRecordMap<any>) => {
    const ctx = compilePath(routeMap, path, prevSegments);

    const currSegmentChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};

    return createRoutes(
      currSegmentChildren,
      renderer,
      ctx,
      mergeParams(prevParams, params)
    );
  };

  const parseParams = (
    path: string,
    params: Record<string, string>, // todo: | string,
    maybeContext?: RenderContext
  ) => {
    const parsedParams: Record<string, any> = {};
    const ctx = maybeContext ?? compilePath(routeMap, path);

    ctx.path.forEach((segment) => {
      if (typeof segment === "string") {
        return;
      }
      if (params[segment.name]) {
        parsedParams[segment.name] = segment.parser.parse(params[segment.name]);
      } else if (segment.kind === "required") {
        throw Error(
          `required path parameter "${segment.name}" was not provided for "${path}"`
        );
      }
    });

    return parsedParams;
  };

  const parseQuery = (
    path: string,
    params: Record<string, string> | string,
    maybeContext?: RenderContext
  ) => {
    const parsedParams: Record<string, any> = {};
    const ctx = maybeContext ?? compilePath(routeMap, path);

    const paramsRecord =
      typeof params === "string"
        ? Object.fromEntries(new URLSearchParams(params))
        : params;

    ctx.query.forEach((segment) => {
      if (paramsRecord[segment.name]) {
        parsedParams[segment.name] = segment.parser.parse(
          paramsRecord[segment.name]
        );
      } else if (segment.kind === "required") {
        throw Error(
          `required path parameter "${segment.name}" was not provided for "${path}"`
        );
      }
    });

    return parsedParams;
  };

  const from = (
    path: string,
    location: string,
    overwriteParams: ParamRecordMap<Record<string, any>>
  ) => {
    // build context from path
    const ctx = compilePath(routeMap, path);

    const lastNodeChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};

    const { parsedParams } = matchLocation(
      path,
      location,
      ctx,
      parseParams,
      parseQuery
    );

    return createRoutes(
      lastNodeChildren,
      renderer,
      ctx,
      mergeParams(prevParams, parsedParams, overwriteParams)
    );
  };

  const replace = (
    path: string,
    location: string,
    overwriteParams: ParamRecordMap<Record<string, any>>
  ) => {
    // basically the same as the from method but returns rendered path with remaining segments appended
    // appends query string as well (if available)

    const ctx = compilePath(routeMap, path);

    const { parsedParams, tail } = matchLocation(
      path,
      location,
      ctx,
      parseParams,
      parseQuery
    );

    const ctxWithTail = {
      ...ctx,
      path: ctx.path.concat(tail.path),
      query: ctx.query.concat(tail.query), // todo add query params
    };

    return render(
      path,
      mergeParams(prevParams, parsedParams, overwriteParams),
      ctxWithTail
    );
  };

  return {
    template,
    bind,
    render,
    parseParams,
    parseQuery,
    from,
    replace,
  } as RoutesContext<any>;
};

const compilePath = (
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

const matchLocation = (
  path: string,
  location: string,
  ctx: RenderContext,
  parseParams: (
    path: string,
    params: Record<string, string>,
    maybeContext?: RenderContext
  ) => Record<string, string>,
  parseQuery: (
    path: string,
    params: Record<string, string>,
    maybeContext?: RenderContext
  ) => Record<string, string>
) => {
  const [pathname, queryString] = location.split("?");

  const remainingPathSegments = pathname
    .slice(pathname[0] === "/" ? 1 : 0)
    .split("/");

  const rawPathParams: Record<string, any> = {};

  // keep track of recent optional params since they might contain path segments
  // if a path segment doesn't match the algorithm continues searching in this array
  const recentOptionalParams: string[] = [];

  ctx.path.forEach((segment) => {
    const pathnameSegment = remainingPathSegments.shift();

    if (typeof segment === "string") {
      if (segment === pathnameSegment) {
        recentOptionalParams.length = 0; // irrelevant from here
      } else {
        // segment might have been swallowed by an optional param
        let recentParam: string | undefined;
        let foundMatch = false;
        while ((recentParam = recentOptionalParams.shift())) {
          if (rawPathParams[recentParam] === segment) {
            delete rawPathParams[recentParam];
            // hold segment back for the next iteration
            pathnameSegment && remainingPathSegments.unshift(pathnameSegment);
            foundMatch = true;
          }
        }
        if (!foundMatch) {
          throw new Error(
            `"${pathname}" doesn't match "${defaultRenderer.template(
              ctx
            )}", missing segment "${segment}"`
          );
        }
      }
    } else {
      rawPathParams[segment.name] = pathnameSegment;
      if (segment.kind === "optional") {
        recentOptionalParams.push(segment.name);
      } else if (!pathnameSegment) {
        throw new Error(
          `"${pathname}" doesn't match "${defaultRenderer.template(
            ctx
          )}", missing parameter "${segment.name}"`
        );
      } else {
        recentOptionalParams.length = 0;
      }
    }
  });
  const rawQueryParams = Object.fromEntries(new URLSearchParams(queryString));

  const parsedParams: ParamRecordMap<Record<string, any>> = {
    path: parseParams(path, rawPathParams, ctx),
    query: parseQuery(path, rawQueryParams, ctx),
  };

  // contains all the remaining path segments and query params
  const tail: {
    path: string[];
    query: AnyParam[];
  } = {
    path: remainingPathSegments,
    query: Object.entries(rawQueryParams).flatMap(([name, value]) => {
      if (!parsedParams.query[name]) {
        parsedParams.query[name] = value;
        return str(name).optional; // context requires a parser, string parser is just the identity function
      }
      return [];
    }),
  };

  return {
    parsedParams,
    tail,
  };
};

const mergeParams = (
  ...args: (ParamRecordMap<Record<string, any>> | undefined)[]
): ParamRecordMap<Record<string, any>> => {
  const result: ParamRecordMap<Record<string, any>> = {
    path: {},
    query: {},
  };

  args.forEach((next) => {
    result.path = { ...result.path, ...next?.path };
    result.query = { ...result.query, ...next?.query };
  });

  return result;
};
