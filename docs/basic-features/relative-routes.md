# Relative routes

The 'relative routes' feature is used for generating subpaths. By default, absolute paths are prefixed with a leading `/` and relative paths are rendered without this prefix. To initiate a relative path, the underscore `_` link can be used to specify the starting segment.

You can modify this default behavior using a custom renderer. Refer to the [Custom Path Rendering](customization/custom-path-rendering.md) section for more examples.

``` ts
import { createRoutes, renderPath } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog"],
    children: {
      categories: {
        path: ["categories"],
        children: {
          year: {
            path: ["music"]
          },
        }
      }
    }
  }
});
```

<!-- tabs:start -->
## **Absolute Routes**

By default an absolute path contains a leading `/` character.

``` ts
renderPath(routes.blog.categories.music, {}); // ~> "/blog/categories/music"
```

## **Relative Routes**

Relative paths don't start with a leading `/` character. 

``` ts
renderPath(routes.blog._.categories, {}); // ~> "categories" (a relative path without the leading "/blog" path segment)

renderPath(routes.blog._.categories.music, {}); // ~> "categories/music"

renderPath(routes.blog.categories._.music, {}); // ~> "music" (two route nodes were omitted)
```
<!-- tabs:end -->
