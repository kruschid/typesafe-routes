import type { ParamRecordMap, RouteNode } from "./routes";

export type RenderContext = {
  skippedNodes: RouteNode[];
  nodes: RouteNode[];
  path: Exclude<RouteNode["path"], undefined>;
  query: Exclude<RouteNode["query"], undefined>;
  isRelative: boolean;
};

export type Renderer = {
  template: (ctx: RenderContext) => string;
  render: (
    segments: RenderContext,
    params: ParamRecordMap<Record<string, unknown>>
  ) => string;
};

export const defaultRenderer: Renderer = {
  template: ({ path, isRelative }) => {
    const template = path
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
  render: ({ path, query, isRelative }, params) => {
    const pathSegments: string[] = [];
    const queryRecord: Record<string, string> = {};

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
      if (params.query[queryParam.name]) {
        queryRecord[queryParam.name] = queryParam.parser.serialize(
          params.query[queryParam.name]
        );
      }
    });

    const searchParams = new URLSearchParams(queryRecord).toString();

    return (
      (isRelative ? "" : "/") +
      pathSegments.join("/") +
      (searchParams ? `?` : "") +
      searchParams
    );
  },
};
