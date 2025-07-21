import { useParams, useSearch } from "wouter";
import { parsePath, parseQuery } from "typesafe-routes";
import { routes } from "../routes";

export const Locations = () => {
  const params = useParams();
  const parsedParams = parsePath(routes.orgs.locations, params);

  const query = useSearch();
  const parsedQuery = parseQuery(routes.orgs.locations, query)

  return (
    <>
      <h2>Locations</h2>
      <pre>Params: {JSON.stringify(parsedParams)}</pre>
      <pre>Query: {JSON.stringify(parsedQuery)}</pre>
    </>
  );
}
