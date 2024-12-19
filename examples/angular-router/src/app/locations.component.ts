import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { merge } from "rxjs";
import { parsePath, parseQuery } from "typesafe-routes";
import { r } from "./app.routes";

@Component({
  standalone: true,
  template: `
    <h1>{{ name }}</h1>
    <h4>Params</h4>
    <pre>{{ params }}</pre>
    <h4>Query</h4>
    <pre>{{ query }}</pre>
  `,
})
export class LocationsComponent {
  name = "Locations Component";
  params = "";
  query = "";

  syncParams() {
    this.query = JSON.stringify(
      parseQuery(r.orgs.locations, this.route.snapshot.queryParams)
    );
    this.params = JSON.stringify(
      parsePath(r.orgs._.locations, this.route.snapshot.params)
    );
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    merge(this.route.queryParamMap, this.route.paramMap).subscribe(() =>
      this.syncParams()
    );
  }
}
