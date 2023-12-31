import { stringify } from "qs";
import { RouteMap, RouteSegment } from "./routes";

export type RenderContext = {
  path: string[];
  query: Record<string, unknown>;
  segments: RouteSegment[];
  isRelative: boolean;
  hasChildren?: boolean;
};

export type Renderer = (routeMap: RouteMap) => {
  template: (segments: RenderContext, path: string) => string;
  render: (segments: RenderContext, path: string) => string;
};

export const defaultRenderer: Renderer = (routeMap) => ({
  template: (ctx, _) => {
    const template = ctx.segments
      .map((currSegment) =>
        currSegment.path
          ?.map((pathSegment) =>
            typeof pathSegment === "string"
              ? pathSegment
              : `:${pathSegment.name}${
                  pathSegment.kind === "optional" ? "?" : ""
                }`
          )
          .join("/")
      )
      .join("/")
      .concat(ctx.hasChildren ? "/*" : "");

    return ctx.isRelative
      ? template //relative
      : `/${template}`; // absolute
  },
  render: (segments, _) => {
    const path = segments.path
      .filter((strOrParam) => strOrParam !== undefined)
      .join("/");
    const query = stringify(segments.query, { addQueryPrefix: true });
    return (segments.isRelative ? path : `/${path}`).concat(query);
  },
});
