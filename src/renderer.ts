import { RenderContext } from "./createRoutes";

export type Renderer = {
  template: (ctx: RenderContext) => string;
  render: (ctx: RenderContext) => string;
};

export const defaultRenderer: Renderer = {
  template: ({ pathSegments, isRelative }) => {
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

    return (
      (isRelative ? "" : "/") +
      path.join("/") +
      (searchParams ? `?` : "") +
      searchParams
    );
  },
};
