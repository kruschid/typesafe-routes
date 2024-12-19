import { Routes } from "@angular/router";
import { createRoutes, int } from "typesafe-routes";
import { template } from "typesafe-routes/angular-router";
import { DashboardComponent } from "./dashboard.component";
import { LocationsComponent } from "./locations.component";
import { OrgsComponent } from "./orgs.component";

export const r = createRoutes({
  dashboard: {
    path: ["dashboard"], // ~> "/dashboard"
  },
  orgs: {
    path: ["orgs", int("orgId")], // ~> "/orgs/:orgId"
    children: {
      locations: {
        path: ["locations", int("locationId")], // ~> "/orgs/:orgId/locations/:locationId"
        query: [int.optional("page")], // ~> "?page=<number>"
      },
    },
  },
});

export const routes: Routes = [
  {
    path: template(r.dashboard),
    component: DashboardComponent,
  },
  {
    path: template(r.orgs),
    component: OrgsComponent,
    children: [
      {
        path: template(r.orgs._.locations),
        component: LocationsComponent,
      },
    ],
  },
];
