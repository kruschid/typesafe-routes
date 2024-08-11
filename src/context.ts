import type { AnyRenderContext, RenderContext } from "./types";

export const renderTemplate = ({
  pathSegments,
  isRelative,
}: AnyRenderContext) => {
  const template = pathSegments
    .map((pathSegment) =>
      typeof pathSegment === "string"
        ? pathSegment
        : `:${pathSegment.name}${pathSegment.kind === "optional" ? "?" : ""}`
    )
    .join("/");

  return isRelative
    ? template //relative
    : `/${template}`; // absolute
};

export const renderPath = ({
  pathSegments,
  isRelative,
  pathParams,
  queryParams,
}: AnyRenderContext) => {
  const path: string[] = [];
  // path params
  pathSegments.forEach((pathSegment) => {
    if (typeof pathSegment === "string") {
      path.push(pathSegment);
    } else if (pathParams[pathSegment.name] != null) {
      path.push(pathParams[pathSegment.name]);
    }
  });

  const searchParams = new URLSearchParams(queryParams).toString();

  const pathname = (isRelative ? "" : "/") + path.join("/");
  const search = (searchParams ? `?` : "") + searchParams;
  const href = pathname + search;

  return href;
};

export const defaultContext: RenderContext<string, string> = {
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
