# Nested routes

Nested route segments are defined through the `children` property, containing an object with additional route segments.

``` js
import { createRoutes } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog"],
    children: {
      categories: {
        path: ["categories"],
        children: {
          movies: {
            path: ["movies"]
          },
        }
      }
    }
  }
});
```

The `render` method's first argument is a path with route segment names separated by a slash `/`.

``` js
routes.render("blog", {}); // => "/blog"

routes.render("blog/categories", {}); // => "/blog/categories"

routes.render("blog/categories/movies", {}); // => "/blog/categories/movies"
```

When supplying multiple segment names, include all corresponding parameters in the second argument as a unified object. For improved clarity in assigning parameters, refer to other sections for guidance on utilizing the `bind` method.

``` js
routes.render("parent/child", {
  // specify parameter values here for "parent" and "child"
  path: {...},
  query: {...},
}); // => "/blog"

```