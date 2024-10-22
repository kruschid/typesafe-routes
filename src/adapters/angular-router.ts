import { createRoutes } from "../routes";
import type {
  AnyRenderContext,
  RenderContext,
  RouteNodeMap,
  RoutesProps,
} from "../types";

export type CreateAngularRoutes<Meta = any> = <
  Routes extends RouteNodeMap<Meta>,
  Context extends AnyRenderContext = RenderContext<string, string>
>(
  routes: Routes,
  context?: Context
) => RoutesProps<Routes, Context> & { $provider: Meta[] };

export const createAngularRoutes: CreateAngularRoutes = (routes, context) => {
  const r = createRoutes(routes, context ?? angularRouterContext) as any;
  return {
    ...r,
    $provider: createRouterProvider(r),
  };
};

const createRouterProvider = <Meta>(
  routeProps: any,
  node = routeProps.$routes
): Meta[] => {
  if (!routeProps || !node) return [];

  return Object.keys(node).map((name) => ({
    path: routeProps[name].$template(),
    children: node[name].children
      ? createRouterProvider(routeProps[name], node[name].children)
      : undefined,
    ...node[name].meta,
  }));
};

const renderPath = ({
  pathSegments,
  isRelative,
  pathParams,
  queryParams,
}: AnyRenderContext) => {
  const path = pathSegments.flatMap((pathSegment) =>
    // prettier-ignore
    typeof pathSegment === "string" ? (
        pathSegment
      ) :  pathParams[pathSegment.name] != null ? (
        pathParams[pathSegment.name]
      ) : []
  );

  return {
    path: (isRelative ? "" : "/") + path.join("/"),
    query: queryParams,
  };
};

const renderTemplate = ({ pathSegments }: AnyRenderContext) => {
  const template = pathSegments
    .map((pathSegment) =>
      typeof pathSegment === "string" ? pathSegment : `:${pathSegment.name}`
    )
    .join("/");

  return template;
};

export const angularRouterContext: RenderContext<
  string,
  { path: string; query: Record<string, string> }
> = {
  renderTemplate,
  renderPath,
  skippedNodes: [],
  nodes: [],
  pathSegments: [],
  querySegments: [],
  isRelative: false,
  pathParams: {},
  queryParams: {},
  currentPathSegments: [],
  currentQuerySegments: [],
};
