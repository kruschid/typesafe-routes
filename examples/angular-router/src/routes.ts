import {
  AnyRenderContext,
  createRoutes,
  defaultContext,
  int,
  RenderContext,
  RouteNode,
  RouteNodeMap,
} from "typesafe-routes";
import { renderPath, renderTemplate } from "./renderer";
import { Route } from "@angular/router";

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

// const createAngularRoutes = () => {};

// createRoutes = withMeta<Route>();
