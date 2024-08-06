 # Absolute routes

The method `createRoutes` takes a routes object as the first argument, where property names represent route names. Each route may specify a `path` using a string array.

``` ts
import { createRoutes } from "typesafe-routes";

const routes = createRoutes({
  // route segment: "about"
  about: { 
    // single segment path
    path: ["about-us"]
  },
  blogCategories: {
    // multiple segments
    path: ["blog", "categories", "all"]
  }
});
```

The `render` method is versatile, taking a variable number of arguments.

<!-- tabs:start -->
## **Root Path**

Calling the `render` method without arguments returns the path of the current context. In this example the context is empty so the method returns the root path: `"/"`

``` ts
routes.render(); // => "/"
```

## **Named Paths**

The first argument holds a string path with the name of the route segment to be rendered. The second argument can be used for passing route parameters. Refer to other sections for detailed examples illustrating the effective utilization of parameters.

``` ts
routes.render("about", {}); // => "/about-us"
routes.render("blogCategories", {}); // => "/blog/categories/all"
```
<!-- tabs:end -->