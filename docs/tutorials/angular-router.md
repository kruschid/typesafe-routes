# Typesafe Routes in Angular

This tutorial contains a few code examples that belong to a case study. If you prefer to explore everything by yourself just scroll down to the end of the article where a stackblitz project with the code is embedded.

## The problem

Routing libraries are usually built on string templates like `/segment/:parameter` and have needed pathnames to match these templates, like `/segment/value`. But when the template is altered without updating each and every pathname that corresponds to that route, links can break easily and undetected. Automated testing can help reduce this, but it also introduces new issues. In addition to the possibility that it is impractical to accomplish full path coverage (that is, to test every potential link path) tests are typically closely linked to implementation, so adding more tests makes maintenance more work.

## The Solution

Fortunately, we don't even need to write a single test line to identify broken links. With typescript and the open source project I've been managing for the past few years, we can accomplish that: [typesafe-routes](https://github.com/kruschid/typesafe-routes). The idea is straightforward: all that needs to be ensured is that each route template and pathname originate from a predefined route tree, or, in other words, that there is only one source of truth for all routes.

``` ts
import { createRoutes, str } from "typesafe-routes";
import { renderer } from "./renderer";

export const r = createRoutes({
  home: {
    path: ["home", str("lang")],
  },
});

r.template("home") // home/:lang
r.render("home", {path: {lang: "en"}}) // /home/en
```

The code above creates a routes tree with a single node called `home`. The path that corresponds to it is made up of two segments: `home`, which is static, and `str("lang")`, which is dynamic and defines a parameter called `"lang"`. Parameter types have significance because typesafe-routes requires understanding of parameter value parsing and serialization. Several parameter types are supported by typesafe-routes out of the box, and custom types are also possible. Using `r.template("home")` and `r.render("home", {path: {lang: "en"}})`, we can now render the template and the path to obtain `/home/:lang` and `/home/en`, respectively. If we now modify the route tree's parameter name to `str("language")` typescript detects non-conforming render calls right away (and without adding a single test). But an experienced Angular user sees a problem here right away. Because of the `/` prefix, the template is incompatible with Angular Router. However, if the proper configuration is used, typesafe-routes can be used with an angular router. The details required for that are provided in the following section.

## Typesafe Routes with Angular Router in Three Steps

In this section, we define an optional search parameter, use a new parameter type `int`, and analyze a nested route tree with a few nodes. Three routes are defined by the route tree below: `firstComponent`, `secondComponent` and, `nestedComponent`.

``` ts
// routes.ts
import { createRoutes, int, angularRouter } from "typesafe-routes";

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
          query: [int.optional("page")],
        },
      },
    },
  },
  angularRouter,
);
```

