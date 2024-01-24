 # Absolute routes

The method `createRoutes` takes a routes object as the first argument, where property names represent route names. Each route may specify a `path` using a string array.

``` js
import { createRoutes } from "typesafe-routes";

const routes = createRoutes({
  // route segment name: "about"
  about: { 
    // single semgent path array
    path: ["about-us"]
  },
  blogCategories: {
    // multiple string segments
    path: ["blog", "categories", "all"]
  }
});
```

The `render` method is versatile, taking a variable number of arguments.

<!-- tabs:start -->
## **Root Path**

Calling the `render` method without arguments returns the path of the current context. In this example the context is empty so the method returns the root path: `"/"`

``` js
routes.render(); // => "/"
```

## **Named Paths**

- The first parameter holds a string path with the name of the path to be rendered
- The second parameter can be used for passing path or query parameters
- Refer to other sections for detailed examples illustrating the effective utilization of these features.

``` js
routes.render("about", {}); // => "/about-us"
routes.render("blogCategories", {}); // => "/blog/categories/all"
```
<!-- tabs:end -->