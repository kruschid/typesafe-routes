import type { RenderContext, RoutesOptions } from "./types";

export const renderTemplate = (
  { pathSegments, isRelative }: RenderContext,
  options?: RoutesOptions<any, any>
) => {
  const template = pathSegments
    .map((pathSegment) =>
      typeof pathSegment === "string"
        ? pathSegment
        : `:${pathSegment.name}${pathSegment.kind === "optional" ? "?" : ""}`
    )
    .join("/");

  const hasPrefix = options?.templatePrefix ?? true;

  return isRelative || !hasPrefix
    ? template //relative
    : `/${template}`; // absolute
};

export const renderPath = ({
  pathSegments,
  isRelative,
  pathParams,
  queryParams,
}: RenderContext) => {
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

export const defaultOptions: RoutesOptions<string, string> = {
  renderTemplate,
  renderPath,
};
