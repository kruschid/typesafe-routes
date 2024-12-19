import { Component } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterOutlet } from "@angular/router";
import { parseLocation } from "typesafe-routes";
import { render } from "typesafe-routes/angular-router";
import { r } from "./app.routes";

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <h1>{{ name }}</h1>
    <ul>
      <li><a [routerLink]="relativeLink.path">Relative Link</a></li>
    </ul>
    <h4>Params</h4>
    <pre>{{ params }}</pre>
    <router-outlet></router-outlet>
  `,
})
export class OrgsComponent {
  name = "Orgs Component";
  relativeLink = render(r.orgs._.locations, {
    path: { locationId: 456 },
    query: { page: 24 },
  });
  params = "";

  constructor(private route: ActivatedRoute) {
    this.params = JSON.stringify(
      parseLocation(r.orgs, this.route.snapshot.params)
    );
  }
}
