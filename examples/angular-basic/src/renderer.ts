import { Renderer, defaultRenderer } from "typesafe-routes";

export const renderer: Renderer<{
  path: string;
  query: Record<string, string>;
}> = {
  ...defaultRenderer,
  render: ({ pathSegments, isRelative, pathParams, queryParams }) => {
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
  },
};
