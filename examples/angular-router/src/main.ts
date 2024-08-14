import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { RouterLink, RouterOutlet } from "@angular/router";
import "zone.js";
import { appConfig } from "./app.config";
import { r } from "./routes";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
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
    </ul>
    <router-outlet></router-outlet>
  `,
})
export class App {
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
