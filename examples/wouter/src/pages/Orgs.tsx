import { useParams } from "wouter";
import { routes } from "../routes";
import { parsePath } from "typesafe-routes";

export const Orgs = () => {
  const params = useParams();

  const parsedParams = parsePath(routes.orgs, params);

  return (
    <>
      <h2>Orgs</h2>
      <pre>params: {JSON.stringify(parsedParams)}</pre>
    </>
  );
}
