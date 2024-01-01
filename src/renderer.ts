import { stringify } from "qs";
import { ParamRecordMap, RouteNode, RouteNodeMap } from "./routes";

export type RenderContext = {
  skippedSegments: RouteNode[];
  segments: RouteNode[];
  isRelative: boolean;
  hasWildcard: boolean;
};

export type Renderer = (routeMap: RouteNodeMap) => {
  template: (ctx: RenderContext, path: string) => string;
  render: (
    segments: RenderContext,
    path: string,
    params: ParamRecordMap<Record<string, unknown>>
  ) => string;
};

export const defaultRenderer: Renderer = (_) => ({
  template: ({ segments, hasWildcard, isRelative }, _) => {
    const template = segments
      .flatMap((currSegment) => currSegment.path ?? []) // node may have undefined path
      .map((pathSegment) =>
        typeof pathSegment === "string"
          ? pathSegment
          : `:${pathSegment.name}${pathSegment.kind === "optional" ? "?" : ""}`
      )
      .join("/")
      .concat(hasWildcard ? "/*" : "");

    return isRelative
      ? template //relative
      : `/${template}`; // absolute
  },
  render: ({ segments, isRelative }, _, params) => {
    const path: string[] = [];
    const query: Record<string, unknown> = {};

    segments.forEach((segment) => {
      // path params
      segment.path?.forEach((pathSegment) => {
        if (typeof pathSegment === "string") {
          path.push(pathSegment);
        } else if (
          pathSegment.kind === "required" &&
          !params.path[pathSegment.name]
        ) {
          throw Error(
            `required path parameter ${pathSegment.name} was not specified`
          );
        } else if (params.path[pathSegment.name]) {
          path.push(
            pathSegment.parser.serialize(params.path[pathSegment.name])
          );
        }
      });

      // query params
      segment.query?.forEach((queryParam) => {
        if (queryParam.kind === "required" && !params.query[queryParam.name]) {
          throw Error(
            `required query parameter ${queryParam.name} was not specified`
          );
        }
        query[queryParam.name as string] = queryParam.parser.serialize(
          params.query[queryParam.name]
        );
      });
    });

    return (
      (isRelative ? "" : "/") +
      path.join("/") +
      stringify(query, { addQueryPrefix: true })
    );
  },
});
