# Nested routes

Nested route segments are defined through the `children` property, containing an object with additional route segments.

``` ts
import { createRoutes } from "typesafe-routes";

const r = createRoutes({
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

To render nested segments, chain the corresponding route-nodes based on their hierarchy and use `$render` on them.

``` ts
r.blog.$render({}); // => "/blog"

r.blog.categories.$render({}); // => "/blog/categories"

r.blog.categories.movies.$render({}); // => "/blog/categories/movies"
```
