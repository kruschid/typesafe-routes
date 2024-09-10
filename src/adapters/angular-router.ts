import type { AnyRenderContext, RenderContext } from "../types";

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

// renders template for angular router
const renderTemplate = ({ pathSegments }: AnyRenderContext) => {
  const template = pathSegments
    .map((pathSegment) =>
      typeof pathSegment === "string" ? pathSegment : `:${pathSegment.name}`
    )
    .join("/");

  return template; // path that doesn't start with a slash "/" character
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
