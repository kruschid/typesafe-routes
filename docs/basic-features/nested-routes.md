# Nested routes

Nested route segments are defined through the `children` property, containing an object with nested route segments.

``` ts
import { createRoutes, renderPath } from "typesafe-routes";

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

To render nested segments, chain the corresponding route-nodes based on their hierarchy and use `renderPath`, `renderQuery` or `render` on them.

``` ts
renderPath(routes.blog, {}); // ~> "/blog"

renderPath(routes.blog.categories, {}); // ~> "/blog/categories"

renderPath(routes.blog.categories.movies, {}); // ~> "/blog/categories/movies"
```
