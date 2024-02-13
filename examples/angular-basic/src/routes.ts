import { createRoutes, int } from "typesafe-routes";
import { renderer } from "./renderer";

export const r = createRoutes(
  {
    firstComponent: {
      path: ["first-component"],
    },
    secondComponent: {
      path: ["second-component", int("aparam")],
      children: {
        nestedComponent: {
          path: ["nested-component", int("bparam")],
          query: [int("page").optional],
        },
      },
    },
  },
  { renderer, templatePrefix: false } // options
);
