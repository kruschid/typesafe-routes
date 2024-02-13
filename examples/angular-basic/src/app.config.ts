import { ApplicationConfig } from "@angular/core";
import { Routes, provideRouter } from "@angular/router";
import { FirstComponent } from "./components/FirstComponent";
import { NestedComponent } from "./components/NestedComponent";
import { SecondComponent } from "./components/SecondComponent";
import { r } from "./routes";

export const routes: Routes = [
  { path: r.template("firstComponent"), component: FirstComponent },
  {
    path: r.template("secondComponent"),
    component: SecondComponent,
    children: [
      {
        path: r.template("secondComponent/_nestedComponent"),
        component: NestedComponent,
      },
    ],
  },
];

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
