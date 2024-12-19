import { Component } from "@angular/core";

@Component({
  standalone: true,
  template: ` <h1>{{ name }}</h1> `,
})
export class DashboardComponent {
  name = "Dashboard Component";
}
