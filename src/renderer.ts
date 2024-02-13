import { RenderContext } from "./createRoutes";
import { CreateRoutesOptions } from "./routes";

export interface Renderer<RenderType> {
  template: (ctx: RenderContext, options?: CreateRoutesOptions<any>) => string;
  render: (ctx: RenderContext) => RenderType;
}

export const defaultRenderer: Renderer<string> = {
  template: ({ pathSegments, isRelative }, options) => {
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
  },
  render: ({ pathSegments, isRelative, pathParams, queryParams }) => {
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
  },
};
