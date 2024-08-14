import { ApplicationConfig } from "@angular/core";
import { Routes, provideRouter } from "@angular/router";
import { FirstComponent } from "./components/FirstComponent";
import { NestedComponent } from "./components/NestedComponent";
import { SecondComponent } from "./components/SecondComponent";
import { r } from "./routes";

export const routes: Routes = [
  { path: r.firstComponent.$template(), component: FirstComponent },
  {
    path: r.secondComponent.$template(),
    component: SecondComponent,
    children: [
      {
        path: r.secondComponent._.nestedComponent.$template(),
        component: NestedComponent,
      },
    ],
  },
];

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
