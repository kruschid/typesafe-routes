import { RenderContext } from "./createRoutes";

export type Renderer = {
  template: (ctx: RenderContext) => string;
  render: (ctx: RenderContext) => string;
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
  render: ({ path, query, isRelative, parsedParams, parsedQuery }) => {
    const pathSegments: string[] = [];
    const queryRecord: Record<string, string> = {};

    // path params
    path.forEach((pathSegment) => {
      if (typeof pathSegment === "string") {
        pathSegments.push(pathSegment);
      } else if (
        pathSegment.kind === "required" &&
        !parsedParams[pathSegment.name]
      ) {
        throw Error(
          `required path parameter ${pathSegment.name} was not specified`
        );
      } else if (parsedParams[pathSegment.name]) {
        pathSegments.push(
          pathSegment.parser.serialize(parsedParams[pathSegment.name])
        );
      }
    });

    // query params
    query.forEach((queryParam) => {
      if (queryParam.kind === "required" && !parsedQuery[queryParam.name]) {
        throw Error(
          `required query parameter ${queryParam.name} was not specified`
        );
      }
      if (parsedQuery[queryParam.name]) {
        queryRecord[queryParam.name] = queryParam.parser.serialize(
          parsedQuery[queryParam.name]
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
