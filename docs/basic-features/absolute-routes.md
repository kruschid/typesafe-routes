 # Absolute routes

The method `createRoutes` takes an object, where property names represent route names. Each route may specify a `path` using a string array. The string array can contain a variable number of segments.

``` ts
import { createRoutes } from "typesafe-routes";

const routes = createRoutes({
  // route segment: "about"
  about: { 
    // single segment path
    path: ["about-us"]
  },
  // route segment: "blogCategories"
  blogCategories: {
    // multiple segments
    path: ["blog", "categories", "all"]
  }
});
```

The paths defined using the `createRoutes` function can be rendered using the `$render` method. 

<!-- tabs:start -->
## **Root Path**

The root path `"/"` is returned when the `$render` method is used applied on `routes`.

``` ts
routes.$render({}); // => "/"
```

An empty object is `$render`'s first argument. It shows that there are no parameters that require rendering. Refer to other sections for detailed examples illustrating the effective utilization of parameters.

## **Route Segments**

When the `$render` method is called on a route segment that was specified with the `createRoutes` function call above, the matching path is rendered.

``` ts
routes.about.$render({}); // => "/about-us"
routes.blogCategorie.$render({}); // => "/blog/categories/all"
```

An empty object is `$render`'s first argument. It shows that there are no parameters that require rendering. Refer to other sections for detailed examples illustrating the effective utilization of parameters.

<!-- tabs:end -->