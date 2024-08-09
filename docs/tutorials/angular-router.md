# Typesafe Routes in Angular

This tutorial contains a few code examples that belong to a case study. If you prefer to explore everything by yourself just scroll down to the end of the article where a stackblitz project with the code is embedded.

## The problem

Routing libraries are usually built on string templates, such as `/segment/:parameter`, and require pathnames that match these templates, like `/segment/value`. However, if the code associated with the template is altered without updating every corresponding pathname for that route, links can easily break and go undetected. Automated component testing can help reduce this risk, but it might also introduce new issues. Beyond the potential impracticality of achieving complete path coverage (i.e., testing every possible link path), tests are typically closely tied to implementation. Therefore, adding more tests could result in increased maintenance workload.

## The Solution

Fortunately, we don't even need to write a single line of test code to identify broken links. Through TypeScript and the open-source project I've been managing for the past few years, [typesafe-routes](https://github.com/kruschid/typesafe-routes), we can achieve exactly that. The concept is straightforward: we only need to ensure that every route template and pathname originate from a predefined route tree. In other words, there should be a single source of truth for all routes.

``` ts
import { createRoutes, str } from "typesafe-routes";
import { renderer } from "./renderer";

export const r = createRoutes({
  home: {
    path: ["home", str("lang")],
  },
});

r.home.$template() // home/:lang
r.home.$render({ path: { lang: "en" }}) // /home/en
```

The code above constructs a route tree with a single node, `home`. The path corresponding to it consists of two segments: `home`, which is static, and `str("lang")`, which is dynamic and defines a parameter called `"lang"`.

The parameter types matter because typesafe-routes require an understanding of parameter value parsing and serialization. Various parameter types are inherently supported by typesafe-routes, but it's also possible to create custom types.

Using `r.home.$template()` and `r.home.$render({path: {lang: "en"}})`, we can render the template and the path to get `/home/:lang` and `/home/en`, respectively.

If we alter the route tree's parameter name to `str("language")`, TypeScript immediately identifies any non-compliant render calls (without adding a single test). However, experienced Angular users might quickly spot a problem: the template is incompatible with the Angular Router due to the `/` prefix. Despite this, typesafe-routes can be set up to work with the Angular Router by utilizing the right configuration. The necessary details are provided in the section that follows.

## Typesafe Routes with Angular Router in Three Steps

In this section, we will define an optional search parameter, introduce a new parameter type - `int`, and explore a nested route tree with several nodes. The following route tree defines three routes: `firstComponent`, `secondComponent`, and `nestedComponent`.

``` ts
// routes.ts
import { createRoutes, int, angularRouter } from "typesafe-routes";

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
  angularRouter,
);
```

In the example above, we used the `angularRouter` preset as the second argument to `createRoutes`, which allows us to render templates without a leading forward slash. If we invoke `r.secondComponent.$template()`, we receive `second-component/:paramA`.

The use of the `angularRouter` preset also resulted in the alteration of the path rendering. With the default preset, `$render` returns a string that incorporates the query string, as `second-component/123/nested-component/321?page=2`.

However, in this scenario, `$render` returns an object that separately lists the path and query string, simplifying the use of `routerLink` and `navigate`.

Now, let's connect our route templates to their respective components.

``` ts
// app.config.ts
export const routes: Routes = [
  {
    path: r.firstComponent.$template(),
    component: FirstComponent
  }, {
    path: r.secondComponent.$template(),
    component: SecondComponent,
    children: [{
      path: r.secondComponent._.nestedComponent.$template(),
      component: NestedComponent,
    }],
  },
];
```

The above code displays several examples of `$template`, which produce the templates for their respective components. However, the route for `NestedComponent` employs a special feature that we haven't yet introduced. 

Angular Router doesn't operate with absolute paths in templates, so we need to inline the path with the `_` node to exclude the segments that are associated with the parent nodes of `nestedComponent`. As such, while `r.secondComponent._.nestedComponent.$template()` returns `nested-component/:paramB`, `r.secondComponent.nestedComponent.$template()` would return an absolute path `second-component/:paramA/nested-component/:paramB`.

The following piece of code illustrates the entry component. This component generates paths and search strings based on some randomly assigned parameter values.

``` ts
// main.ts

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
  // { path: "/first-component", query: {}}
  secondComponentLink = r.secondComponent.$render({
    path: { paramA: 123 },
  }); // { path: "/second-component/123", query: {}}
  nestedComponentLink = r.secondComponent.nestedComponent.$render({
    path: { paramA: 321, paramB: 654 },
    query: { page: 42 },
  }); // { path: "/second-component/321/nested-component/654", query: { page: "42" }}
}
```

Because we are using the `angularRouter` preset, the `$render` method will return an object containing `path` and `query`. You can subsequently pass these properties to `[routerLink]`, `[queryParams]`, or to `this.router.navigate`.

## Parameter Parsing

