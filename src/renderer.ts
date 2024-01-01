import { stringify } from "qs";
import { ParamRecordMap, RouteNode, RouteNodeMap } from "./routes";

export type RenderContext = {
  skippedNodes: RouteNode[];
  nodes: RouteNode[];
  path: Exclude<RouteNode["path"], undefined>;
  query: Exclude<RouteNode["query"], undefined>;
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
  template: ({ path, hasWildcard, isRelative }, _) => {
    const template = path
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
  render: ({ path, query, isRelative }, _, params) => {
    const pathSegments: string[] = [];
    const queryRecord: Record<string, unknown> = {};

    // path params
    path.forEach((pathSegment) => {
      if (typeof pathSegment === "string") {
        pathSegments.push(pathSegment);
      } else if (
        pathSegment.kind === "required" &&
        !params.path[pathSegment.name]
      ) {
        throw Error(
          `required path parameter ${pathSegment.name} was not specified`
        );
      } else if (params.path[pathSegment.name]) {
        pathSegments.push(
          pathSegment.parser.serialize(params.path[pathSegment.name])
        );
      }
    });

    // query params
    query.forEach((queryParam) => {
      if (queryParam.kind === "required" && !params.query[queryParam.name]) {
        throw Error(
          `required query parameter ${queryParam.name} was not specified`
        );
      }
      queryRecord[queryParam.name as string] = queryParam.parser.serialize(
        params.query[queryParam.name]
      );
    });

    return (
      (isRelative ? "" : "/") +
      pathSegments.join("/") +
      stringify(queryRecord, { addQueryPrefix: true })
    );
  },
});
