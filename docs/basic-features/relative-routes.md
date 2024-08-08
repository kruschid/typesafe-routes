# Relative routes

The 'relative routes' feature is used for generating subpaths. With the default renderer, absolute paths are prefixed with a leading `/`. However, when using the default renderer, relative paths are rendered without this prefix. To initiate a relative path, the underscore `_` link can be used to specify the starting segment.

You can modify this default behavior using a custom renderer. Refer to the [Custom Path Rendering](customization/custom-path-rendering.md) section for more examples.

``` ts
import { createRoutes } from "typesafe-routes";

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

With the default renderer an absolute path contains a leading `/` character.

``` ts
routes.blog.categories.music.$render({}); // => "/blog/categories/music"
```

## **Relative Routes**

Relative paths don't start with a leading `/` character. 

``` ts
routes.blog._.categories.$render({}); // => "categories" (a relative path without the leading "/blog" path segment)

routes.blog._.categories.music.$render({}); // => "categories/music"

routes.blog.categories._.music.$render({}); // => "music" (we omitted two route nodes here)
```
<!-- tabs:end -->
