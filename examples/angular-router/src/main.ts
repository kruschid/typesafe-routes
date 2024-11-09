import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { RouterLink, RouterOutlet } from "@angular/router";
import "zone.js";
import { appConfig } from "./app.config";
import { TypesafeRoutesModule } from "./renderer";
import { r } from "./routes";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, TypesafeRoutesModule],
  template: `
    <h1>Absolute Links</h1>
    <ul>
      <li><a [routerLink]="firstComponentLink.path">First Component</a></li>
      <li><a [routerLink]="secondComponentLink.path">Second Component</a></li>
      <li>
        <a
          [routerLink]="nestedComponentLink.path"
          [queryParams]="nestedComponentLink.query"
        >
          Nested Component
        </a>
      </li>
      <li>
        <a
          [typesafeRoutesLink]="routes.secondComponent.nestedComponent.$render({
            path: { paramA: 321, paramB: 654 },
            query: { page: 42 },
          })"
        >
          Nested Component
        </a>
      </li>
    </ul>
    <router-outlet></router-outlet>
  `,
})
class App {
  routes = r;
  firstComponentLink = r.firstComponent.$render({});
  secondComponentLink = r.secondComponent.$render({
    path: { paramA: 123 },
  });
  nestedComponentLink = r.secondComponent.nestedComponent.$render({
    path: { paramA: 321, paramB: 654 },
    query: { page: 42 },
  });
}

bootstrapApplication(App, appConfig);
