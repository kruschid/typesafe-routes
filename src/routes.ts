import type {
  Context,
  CreateRoutes,
  ParseLocationFn,
  ParsePathFn,
  ParseQueryFn,
  RenderFn,
  RenderPathFn,
  RenderQueryFn,
  ReplaceFn,
  SafeParseLocationFn,
  SafeParsePathFn,
  SafeParseQueryFn,
  SafeParseResult,
  TemplateFn,
  WithContext,
} from "./types";

export const createRoutes: CreateRoutes = (routeMap) => {
  const proxy = (ctx: Context): any =>
    new Proxy(
      {
        ["~context"]: ctx,
        ["~routes"]: routeMap,
      },
      {
        get: (target, maybeRouteName, receiver) =>
          typeof maybeRouteName === "string" && maybeRouteName[0] !== "~"
            ? proxy(addRoute(maybeRouteName, ctx))
            : Reflect.get(target, maybeRouteName, receiver),
      }
    );

  return proxy({
    isRelative: false,
    path: [],
    children: routeMap,
    nodes: [],
    relativeNodes: [],
  });
};

const addRoute = (routeName: string, ctx: Context): Context => {
  if (routeName === "_") {
    return {
      ...ctx,
      path: ctx.path.concat(routeName),
      nodes: ctx.nodes.concat(ctx.nodes),
      relativeNodes: [],
      isRelative: true,
    };
  }
  const route = ctx.children?.[routeName];
  if (!route) {
    throw Error(
      `unknown segment ${routeName} in ${ctx.path.concat(routeName)}`
    );
  }
  return {
    ...ctx,
    path: ctx.path.concat(routeName),
    nodes: ctx.nodes.concat(route),
    relativeNodes: ctx.relativeNodes.concat(route),
    children: route.children,
  };
};

export const template: TemplateFn = ({
  "~context": { isRelative, relativeNodes: pathNodes },
}) => {
  const prefix = isRelative ? "" : "/";

  const serializedTemplate = pathNodes
    .flatMap((route) => route.template ?? route.path ?? [])
    .map((segment) =>
      typeof segment === "string"
        ? segment
        : segment.options?.template ??
          `:${segment.name}${segment.kind === "optional" ? "?" : ""}`
    )
    .join("/");

  return prefix + serializedTemplate;
};

export const renderPath: RenderPathFn = (
  { "~context": { relativeNodes: pathNodes, isRelative } },
  params: Record<string, any>
) => {
  const serializedPath = pathNodes
    .flatMap((route) => route.path ?? [])
    .map((pathSegment) =>
      typeof pathSegment === "string"
        ? pathSegment
        : pathSegment.parser.serialize(params[pathSegment.name])
    )
    .join("/");

  return (isRelative ? "" : "/") + serializedPath;
};

export const renderQuery: RenderQueryFn = (
  { "~context": { nodes } },
  params: Record<string, any>
) => {
  const serializedQueryRecord: Record<string, string> = {};

  nodes
    .flatMap((route) => route.query ?? [])
    .forEach(({ name, parser }) => {
      if (params[name] !== undefined) {
        serializedQueryRecord[name] = parser.serialize(params[name]);
      }
    });

  return new URLSearchParams(serializedQueryRecord).toString();
};

export const render: RenderFn = (route, params) => {
  const pathname = renderPath(route, params["path"]);
  const searchParams = renderQuery(route, params["query"]);
  const separator = searchParams ? `?` : "";

  return pathname + separator + searchParams;
};

export const parsePath: ParsePathFn = (route, paramsOrPath) => {
  const params =
    typeof paramsOrPath === "string"
      ? paramsFromLocationPath(route, paramsOrPath).pathParams
      : paramsOrPath;
  const parsedParams: Record<string, any> = {};

  route["~context"].relativeNodes
    .flatMap((route) => route.path ?? [])
    .forEach((segment) => {
      if (typeof segment === "string") {
      } else if (params[segment.name] !== undefined) {
        parsedParams[segment.name] = segment.parser.parse(params[segment.name]);
      } else if (segment.kind === "required") {
        throw Error(
          `parsePath: required path parameter "${
            segment.name
          }" was not provided in "${template(route)}"`
        );
      }
    });

  return parsedParams as any;
};

export const parseQuery: ParseQueryFn = (route, paramsOrQuery) => {
  const params =
    typeof paramsOrQuery === "string"
      ? paramsFromQuery(paramsOrQuery)
      : paramsOrQuery;

  const parsedQuery: Record<string, any> = {};

  route["~context"].nodes
    .flatMap((route) => route.query ?? [])
    .forEach((segment) => {
      const value = params[segment.name];
      if (value != null) {
        parsedQuery[segment.name] = segment.parser.parse(value);
      } else if (segment.kind === "required") {
        throw Error(
          `parseQuery: required query parameter "${
            segment.name
          }" was not provided in "${template(route)}"`
        );
      }
    });

  return parsedQuery as any;
};

export const parseLocation: ParseLocationFn = (route, paramsOrLocation) => {
  const [pathParams, queryParams] =
    typeof paramsOrLocation === "string"
      ? paramsOrLocation.split("&")
      : [paramsOrLocation, paramsOrLocation];

  return {
    path: parsePath(route, pathParams),
    query: parseQuery(route, queryParams),
  };
};

export const replace: ReplaceFn = (
  route,
  location,
  params: Record<string, any>
) => {
  const [locationPath, locationQuery] = location.split("?");

  const { pathParams, remainingSegments } = paramsFromLocationPath(
    route,
    locationPath
  );

  const {
    "~context": { isRelative, relativeNodes, nodes },
  } = route;

  const pathname = relativeNodes
    .flatMap((route) => route.path ?? [])
    .flatMap((pathSegment) => {
      if (typeof pathSegment === "string") return pathSegment;

      const { name, kind, parser } = pathSegment;

      if (params["path"] && name in params["path"]) {
        if (typeof params["path"][name] !== "undefined")
          return parser.serialize(params["path"][name]);

        if (kind === "required") {
          throw Error(
            `replace: required path param ${name} can't be set to undefined`
          );
        }
        return [];
      }

      return pathParams[name] ?? [];
    })
    .concat(remainingSegments)
    .join("/");

  const queryParams = paramsFromQuery(locationQuery);

  if (params["query"]) {
    nodes
      .flatMap((r) => r.query ?? [])
      .forEach(({ name, parser, kind }) => {
        if (typeof params["query"][name] !== "undefined") {
          queryParams[name] = parser.serialize(params["query"][name]);
        } else if (name in params["query"]) {
          if (kind === "required") {
            throw Error(
              `replace: required query param ${name} can't be set to undefined`
            );
          } else {
            delete queryParams[name];
          }
        }
      });
  }

  const prefix = isRelative ? "" : "/";
  const searchParams = new URLSearchParams(queryParams).toString();
  const separator = searchParams ? `?` : "";

  return prefix + pathname + separator + searchParams;
};

const paramsFromQuery = (query: string) =>
  Object.fromEntries(new URLSearchParams(query));

const paramsFromLocationPath = (
  route: WithContext,
  locationPath: string = ""
) => {
  const remainingSegments = locationPath
    .slice(locationPath[0] === "/" ? 1 : 0)
    .split("/");

  const pathParams: Record<string, string> = {};

  // keep track of recent optional params since they might contain path segments
  // if a path segment doesn't match the algorithm starts backtracking in this array
  const recentOptionalParams: string[] = [];

  route["~context"].relativeNodes
    .flatMap((r) => r.path ?? [])
    .forEach((segment) => {
      const locationPathSegment = remainingSegments.shift();

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
              locationPathSegment &&
                remainingSegments.unshift(locationPathSegment);
              foundMatch = true;
            }
          }
          if (!foundMatch) {
            throw new Error(
              `"${locationPath}" doesn't match "${template(
                route
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
            `"${locationPath}" doesn't match "${template(
              route
            )}", missing parameter "${segment.name}"`
          );
        }
      }
    });

  return {
    pathParams,
    remainingSegments,
  };
};

export const safeCall =
  <T extends (...args: any[]) => any>(fn: T) =>
  (...params: any[]): SafeParseResult<any> => {
    try {
      const result = fn(...params);
      return {
        success: true,
        data: result,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err
            : new Error(err === "string" ? err : `unknown error: ${err}`),
      };
    }
  };

export const safeParsePath: SafeParsePathFn = safeCall(parsePath);
export const safeParseQuery: SafeParseQueryFn = safeCall(parseQuery);
export const safeParseLocation: SafeParseLocationFn = safeCall(parseLocation);
