import { Component } from "@angular/core";
import { RouterOutlet, RouterLink } from "@angular/router";
import { render, renderPath } from "typesafe-routes/angular-router";
import { r } from "./app.routes";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, RouterLink],
  template: `
    <h1>Absolute Links</h1>
    <ul>
      <li><a [routerLink]="dashboardLink">Dashboard</a></li>
      <li><a [routerLink]="orgsLink">Org</a></li>
      <li>
        <a [routerLink]="locationLink.path" [queryParams]="locationLink.query">
          Location
        </a>
      </li>
    </ul>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  dashboardLink = renderPath(r.dashboard, {});
  orgsLink = renderPath(r.orgs, { orgId: 123 });
  locationLink = render(r.orgs.locations, {
    path: { orgId: 321, locationId: 654 },
    query: { page: 42 },
  });
}
