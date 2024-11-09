# Typesafe Routes in Angular

This tutorial contains a few code examples that belong to a case study. If you prefer to explore everything by yourself just scroll down to the end of the article where a stackblitz project with the code is embedded.

## The problem

  - traditionally routing libraries are based on string templates such as `/segment/:parameter` and expect pathnames to match these templates e.g. `/segment/value`
  - however links can break easily without noticing when the template is changed without updating every single pathname that corresponds to that route
  - on the one hand this can be mitigated with automated testing but this creates new problems
  - not only might it be unpractical to achieve full path coverage to cover every possible link path with tests
  - also tests are usually tightly coupled to the implementation, thus creating more tests increases the effort for maintenance

## The Solution

  - luckily we can detect broken links without writing even one line of tests
  - we can achieve that with the help of typescript and the open source project that I've been maintaing in the last couple of years: typesafe-routes
  - the concept is simple, we only need to make sure that every route template and pathname is derived from a predefined route tree, a single source of truth for routes so to say

``` ts
import { createRoutes, str } from "typesafe-routes";
import { renderer } from "./renderer";

export const r = createRoutes({
  home: {
    path: ["home", str("lang")],
  },
});
```
  - in the code above a routes tree with one single node `home` is created.
  - the corresponding path consists of a static segment `home` and a dynamic segment `str("lang")` which defines a parameter of type string named `"lang"`.
  - parameter types are relevant since typesafe-routes needs to know how to parse and serialize parameter values
  - typesafe-routes supports a bunch of parameter types out of the box and allows custom types as well
  - we can now render the template and the path with `r.template("home")` and `t.render("home", {path: {lang: "en"}})` and get `/home/:lang` and `/home/en`
  - if we now change the parameter name in the route tree to `str("language")` typescript immediately reports the non-conforming render calls without adding one single test
  - however the experienced angular reader notices immediately a problem here
  - the template has a `/` prefix and thus is not compatible with Angular Router
  - typesafe-routes is compatible with angular router if we use the right configuration
  - the next section provides the necessary details 

## Typesafe Routes with Angular Router in Three Steps 

- in this section we examine a nested route tree with a couple of node, use a new parameter type `int` and, define an optional search parameter 
- the route tree below defines three routes: 
  - firstComponent,
  - secondComponent and,
  - nestedComponent

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
          query: [int("page").optional],
        },
      },
    },
  },
  angularRouter,
);
```
- This time we provided the `angularRouter` preset as the second argument of `createRoutes` and get templates without a leading forward slash.
- If we call `r.template("secondComponent")`, we get `second-component/:aparam`.
- The `angularRouter` preset also changed the path rendering.
- With the default preset `render` returns string that include the query string like for example `second-component/123/nested-component/321?page=2`.
- In this case however `render` returns an object containing the path and query string separately to make the usage of `routerLink` and `navigate` more convenient
- we will see an example shortly but first let's assign our route templates to their components
- 
``` ts
// app.config.ts
export const routes: Routes = [
  {
    path: r.template("firstComponent"),
    component: FirstComponent
  }, {
    path: r.template("secondComponent"),
    component: SecondComponent,
    children: [{
      path: r.template("secondComponent/_nestedComponent"),
      component: NestedComponent,
    }],
  },
];
```

- In the code above you can see a couple of `r.template` that return the templates for their component counterparts
- however the route for `NestedComponent` is using a special feature that we haven't introduced yet
- angular router doesn't work with absolute paths in templates so we need to inline the path with the `_` prefix to omit the segments that belong to the parent nodes of `nestedComponent`
- `r.template("secondComponent/_nestedComponent")` returns `nested-component/:bparam` while `r.template("secondComponent/nestedComponent")` would return the absolute path `second-component/:aparam/nested-component/:bparam`.

- the following code shows the entry component that generates paths and search strings based on some random parameter values

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
  firstComponentLink = r.render("firstComponent", {});
  secondComponentLink = r.render("secondComponent", {
    path: { aparam: 123 },
  });
  nestedComponentLink = r.render("secondComponent/nestedComponent", {
    path: { aparam: 321, bparam: 654 },
    query: { page: 42 },
  });
}
```

- with the `angularRouter` preset the `render` method returns an object with `path` and `query`
- you can pass their values to `[routerLink]`, `[queryParams]` or, `this.router.navigate`.

## Parameter Parsing

- in Angular the path and query parameters can be retreived with `this.route.snapshot.params` and `this.route.snapshot.queryParams`
- however parameters are string values by default, which is also the case with other router libraries such as react-router
- given the location path `/second-component/321/nested-component/654?page=42` from our example above, to compute the next page number `43` based on the current page a parsing step is necessary to turn the string param into an integer number
- there are also other scenarios that require parsing parameters and converting them one by one to their corresponding type
- luckily we already specified the parameter types in our routes tree before so a simple `parseParams` call suffice:

``` ts
r.parseParams(
  "secondComponent/_nestedComponent",
  this.route.snapshot.params
) // => { bparam: 654 }
```
- since path inlining via `_` is supported as well we can parse params that belog to the `nestedComponent` route selectively.
- by the way it's also possible to pass the location path as the parameter source

``` ts
r.parseParams(
  "secondComponent/nestedComponent",
  location.pathname, // `/second-component/321/nested-component/654`
) // => { aparam: 321, bparam: 654 }
```

- when using relative routes the location path should also be relative and match the route:

``` ts
r.parseParams(
  "secondComponent/_nestedComponent",
  "nested-component/654"
) // => { bparam: 654 }
```

- to parse query parameters the `parseQuery` method can be called with either `this.route.snapshot.queryParams` or a query string.

``` ts
r.parseQuery(
  "secondComponent/_nestedComponent",
  this.route.snapshot.queryParams, // or location.search
) // => { page: 42 }
```


## But wait, there is more

- typesafe-routes offers some additional util methods that can help with the development of web applications

### `replace` 
- the `replace` method modifies parameters of an existing path in one single step eliminating additional effort of parsing and re-compositioning the path

``` ts
r.replace(
  "secondComponent",
  "/second-component/321/nested-component/654?page=42",
  { path: { aparam: 123 } }
); // => /second-component/123/nested-component/654?page=42
```

- the return value only changes the second path segment from `321` to `123`. all the other segments and the q uery string remain unchanged
- inlining with the `_` prefix in the first argument is supported as well if a relative path is provided as the second argument
- in the example only one segment was modified but this is only coincidental, it's absolutely possible to modify multiple segments in one single call
- query parameters can be modified as well

### `from`

- the `from` method allows building new paths based on an existing location path

``` ts
r.from(
  "secondComponent",
  location.pathname, // "/second-component/321"
  { path: { aparam: 123 }}
)
.render(
  "nestedComponent",
  { path: { bparam: 1337 }}
) // => "/second-component/123/nested-component/1337"
```

- `from` takes the location path as the second parameter, the first parameter specifies the corresponding route path
- the third parameter is used to override one parameter but that's optional
- `from` create a new context where methods like `render` can be applied on the child routes such as `nestedComponent`

### `bind`

- the `bind` method assigns parameter values to a route without creating a string path.
- it can be passed down to other components to be assigned with even more parameter values or rendered to a later point in the code execution

``` ts
const route = r.bind(
  "secondComponent",
  { path: { aparam: 41 }}
);

// ...

// could be rendered in a different component
route.render(
  "nestedComponent",
  { path: { bparam: 42 }}
) // => "/second-component/41/nested-component/42"
```

## Conclusion and Contribution Guide

- in this tutorial we explored ways to manage routes in a typesafe way with typesafe-routes and angular router
- typesafe-routes has many features and can also be used with other frontend ecosystems like React
- if you like to learn more about the othe typesafe-routes feature you can visit the documentation or the github repository

- if you've read this far it might mean that you find typesafety interesting
- typesafe-routes is published under the MIT open source license and you are very welcome to contribute.
- anyone is welcome to help and these are a few possible ways I would appreaciate
  - leave us star in github
  - report bugs 
  - create a patch
  - help others
  - buy me a coffee

- the markdown file with this tutorial can also be found in the github repository, so don't hesitate to fight typos with pull requests

## Appendix

<!-- stackblitz -->