import { createRoutes, int } from "typesafe-routes";

export const routes = createRoutes({
  dashboard: {
    path: ["dashboard"]
  },
  orgs: {
    path: ["orgs", int("orgId")],
    children: {
      locations: {
        path: ["locations", int("locationId")],
        query: [int("page")],
      }
    }
  }
});
