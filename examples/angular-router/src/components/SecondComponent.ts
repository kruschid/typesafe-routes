import { Component } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterOutlet } from "@angular/router";
import { r } from "../routes";

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
export class SecondComponent {
  name = "Second Component";
  relativeLink = r.secondComponent._.nestedComponent.$render({
    path: { paramB: 456 },
    query: { page: 24 },
  });
  params = JSON.stringify(
    r.secondComponent.$parseParams(this.route.snapshot.params)
  );

  constructor(private route: ActivatedRoute) {}
}
