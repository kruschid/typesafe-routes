import { match } from "path-to-regexp";
import { RenderContext, defaultRenderer } from "./renderer";
import type {
  CreateRoutes,
  ParamRecordMap,
  RouteNodeMap,
  RoutesContext,
} from "./routes";

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

  const render = (path?: string, params?: ParamRecordMap<any>) => {
    const ctx = compilePath(routeMap, path, prevSegments);

    return renderer.render(ctx, {
      path: { ...prevParams.path, ...params?.path },
      query: { ...prevParams.query, ...params?.query },
    });
  };

  const bind = (path: string, params: ParamRecordMap<any>) => {
    const ctx = compilePath(routeMap, path, prevSegments);

    const currSegmentChildren = ctx.nodes[ctx.nodes.length - 1].children ?? {};

    return createRoutes(currSegmentChildren, renderer, ctx, {
      path: { ...prevParams.path, ...params.path },
      query: { ...prevParams.query, ...params.query },
    });
  };

  const params = (path: string, params: Record<string, string>) => {
    const parsedParams: Record<string, any> = {};
    const ctx = compilePath(routeMap, path);

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
    const ctx = compilePath(routeMap, path);

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
    const ctx = compilePath(routeMap, path);
    const template = defaultRenderer.template(ctx);
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
