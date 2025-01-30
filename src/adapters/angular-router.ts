import { OptionalDeep } from "ts-toolbelt/out/Object/Optional";
import {
  InferParams,
  InferQueryParams,
  paramsFromLocationPath,
  paramsFromQuery,
  RenderPathFn,
  TemplateFn,
  WithContext,
} from "../";

type RenderFn = <R extends WithContext>(
  route: R,
  params: InferParams<R>
) => {
  path: string;
  query: Record<string, string>;
};

type RenderQueryFn = <R extends WithContext>(
  route: R,
  queryParams: InferQueryParams<R>
) => Record<string, string>;

type ReplaceFn = <R extends WithContext>(
  route: R,
  location: string,
  params: OptionalDeep<InferParams<R>>
) => ReturnType<RenderFn>;

export const renderPath: RenderPathFn = (
  { "~context": { relativeNodes, isRelative } },
  pathParams: Record<string, any>
) => {
  const serializedPath = relativeNodes
    .flatMap((node) => node.path ?? [])
    .flatMap((pathSegment) =>
      // prettier-ignore
      typeof pathSegment === "string" ? (
        pathSegment
      ) :  pathParams[pathSegment.name] !== undefined ? (
        pathSegment.parser.serialize(pathParams[pathSegment.name])
      ) : []
    )
    .join("/");

  return (
    (isRelative || serializedPath.match(/^(http|https):\/\//) ? "" : "/") +
    serializedPath
  );
};

export const renderQuery: RenderQueryFn = (
  { "~context": { nodes } },
  queryParams: Record<string, any>
) => {
  const serializedQueryRecord: Record<string, string> = {};

  nodes
    .flatMap((route) => route.query ?? [])
    .forEach(({ name, parser }) => {
      if (queryParams[name] !== undefined) {
        serializedQueryRecord[name] = parser.serialize(queryParams[name]);
      }
    });
  return serializedQueryRecord;
};

export const render: RenderFn = (
  route,
  { path: pathParams, query: queryParams }
) => {
  return {
    path: renderPath(route, pathParams),
    query: renderQuery(route, queryParams),
  };
};

export const template: TemplateFn = ({ "~context": { relativeNodes } }) => {
  const template = relativeNodes
    .flatMap((node) => node.path ?? [])
    .map((pathSegment) =>
      typeof pathSegment === "string" ? pathSegment : `:${pathSegment.name}`
    )
    .join("/");

  return template;
};

export const replace: ReplaceFn = (
  route,
  location,
  params: Record<string, any>
) => {
  const [locationPath, locationQuery] = location.split("?");

  const { pathParams, remainingSegments } = paramsFromLocationPath(
    route,
    locationPath
  );

  const {
    "~context": { relativeNodes, nodes, isRelative },
  } = route;

  const pathname = relativeNodes
    .flatMap((node) => node.path ?? [])
    .flatMap((pathSegment) => {
      if (typeof pathSegment === "string") return pathSegment;

      const { name, kind, parser } = pathSegment;

      if (params["path"] && name in params["path"]) {
        if (typeof params["path"][name] !== "undefined")
          return parser.serialize(params["path"][name]);

        if (kind === "required") {
          throw Error(
            `replace: required path param ${name} can't be set to undefined in ${template(
              route
            )}`
          );
        }
        return [];
      }

      return pathParams[name] ?? [];
    })
    .concat(remainingSegments)
    .join("/");

  const queryParams = paramsFromQuery(locationQuery);

  if (params["query"]) {
    nodes
      .flatMap((node) => node.query ?? [])
      .forEach(({ name, parser, kind }) => {
        if (typeof params["query"][name] !== "undefined") {
          queryParams[name] = parser.serialize(params["query"][name]);
        } else if (name in params["query"]) {
          if (kind === "required") {
            throw Error(
              `replace: required query param ${name} can't be set to undefined in ${template(
                route
              )}`
            );
          } else {
            delete queryParams[name];
          }
        }
      });
  }

  return {
    path: (isRelative ? "" : "/") + pathname,
    query: queryParams,
  };
};
