import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { merge } from "rxjs";
import { r } from "../routes";

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
export class NestedComponent {
  name = "Nested Component";
  params = "";
  query = "";

  syncParams() {
    this.query = JSON.stringify(
      r.parseQuery(
        "secondComponent/_nestedComponent",
        this.route.snapshot.queryParams
      )
    );
    this.params = JSON.stringify(
      r.parseParams(
        "secondComponent/_nestedComponent",
        this.route.snapshot.params
      )
    );
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    merge(this.route.queryParamMap, this.route.paramMap).subscribe(() =>
      this.syncParams()
    );
  }
}
