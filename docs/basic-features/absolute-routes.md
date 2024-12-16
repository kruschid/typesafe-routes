 # Absolute routes

The method `createRoutes` takes an object, where property names represent route names. Each route may specify a `path` using a string array. The string array can contain a variable number of segments.

``` ts
import { createRoutes, renderPath } from "typesafe-routes";

const routes = createRoutes({
  // route segment: "about"
  about: { 
    // single segment path
    path: ["about-us"]
  },
  // route segment: "blogCategories"
  blogCategories: {
    // multiple segments
    path: ["blog", "categories"]
  }
});
```

The paths defined using the `createRoutes` function can be rendered using the `renderPath` function. 

<!-- tabs:start -->
## **Root Path**

The root path `"/"` is returned when the `renderPath` function is called with `routes`.

``` ts
renderPath(routes, {}) // ~> "/"
```

An empty object is `renderPath`'s second argument. It shows that there are no parameters that require rendering. Refer to other sections for detailed examples illustrating the effective utilization of parameters.

## **Route Segments**

When the `renderPath` functions is called with a route segment that was specified with the `createRoutes` function call above, the matching path is rendered.

``` ts
renderPath(routes.about, {}); // ~> "/about-us"
renderPath(routes.blogCategories, {}); // ~> "/blog/categories"
```

An empty object is `renderPath`'s second argument. It shows that there are no parameters that require rendering. Refer to other sections for detailed examples illustrating the effective utilization of parameters.

<!-- tabs:end -->