import { stringify } from "qs";
import { AnyParam } from "./param";
import { RouteMap } from "./routes";

export type RenderableSegments = {
  path: (string | AnyParam)[];
  query: AnyParam[];
  isRelative: Boolean;
};

export type Renderer = (routeMap: RouteMap) => {
  template: (path: string) => string;
  render: (segments: RenderableSegments, path: string) => string;
};

export const defaultRenderer: Renderer = (routeMap) => ({
  template: (path) => {
    let startAt = 0;
    let nextSegment: RouteMap | undefined = routeMap;

    const template = path
      .split("/")
      .map((segmentName, i) => {
        if (!nextSegment) {
          throw Error(`unknown template segment ${segmentName}`);
        }

        if (segmentName === "*") {
          return segmentName;
        }

        if (segmentName[0] === "_") {
          segmentName = segmentName.slice(1);
          startAt = i;
        }

        const currSegment = nextSegment[segmentName];
        nextSegment = currSegment.children;

        return currSegment.path
          ?.map((p) =>
            typeof p === "string"
              ? p
              : `:${p.name}${p.kind === "optional" ? "?" : ""}`
          )
          .join("/");
      })
      .slice(startAt)
      .join("/");

    return startAt === 0
      ? `/${template}` // absolute
      : template; //relative
  },
  render: (segments, _) => {
    // console.log(segments);
    const path = segments.path
      .map((strOrParam) =>
        typeof strOrParam === "string" ? strOrParam : strOrParam.value
      )
      .filter((strOrParam) => strOrParam !== undefined)
      .join("/");
    const query = stringify(
      segments.query.reduce(
        (acc, param) => ({
          ...acc,
          [param.name]: param.value,
        }),
        {}
      ),
      { addQueryPrefix: true }
    );
    return (segments.isRelative ? path : `/${path}`).concat(query);
  },
});
