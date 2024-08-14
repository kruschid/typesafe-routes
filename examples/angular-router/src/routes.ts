import { createRoutes, defaultContext, int } from "typesafe-routes";
import { renderPath, renderTemplate } from "./renderer";

export const r = createRoutes(
  {
    firstComponent: {
      path: ["first-component"],
    },
    secondComponent: {
      path: ["second-component", int("paramA")],
      children: {
        nestedComponent: {
          path: ["nested-component", int("paramB")],
          query: [int.optional("page")],
        },
      },
    },
  },
  { ...defaultContext, renderPath, renderTemplate }
);
