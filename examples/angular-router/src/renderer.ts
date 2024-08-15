import { AnyRenderContext } from "typesafe-routes";

// renders paths and query record for angular router
export const renderPath = ({
  pathSegments,
  isRelative,
  pathParams,
  queryParams,
}: AnyRenderContext) => {
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
};

// renders template for angular router
export const renderTemplate = ({ pathSegments }: AnyRenderContext) => {
  const template = pathSegments
    .map((pathSegment) =>
      typeof pathSegment === "string" ? pathSegment : `:${pathSegment.name}`
    )
    .join("/");

  return template; // path that doesn't start with a slash "/" character
};
