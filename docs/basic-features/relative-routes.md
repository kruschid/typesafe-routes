# Relative routes

Create relative routes by prefixing a route segment with an underscore `_` within the `render` method's path argument. The relative path returned begins without a leading `/` character and excludes any route nodes specified before the `_`. You can modify this default behavior using a custom renderer. Refer to the customization section for more examples.

``` js
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

``` js
routes.render("blog/categories/music", {}); // => "/blog/categories/music"
```

## **Relative Routes**

Relative paths don't start with a leading `/` character. 

``` js
routes.render("blog/_categories", {}); // => "categories" (a relative path without the leading "/blog" path segment)

routes.render("blog/_categories/music", {}); // => "categories/music"

routes.render("blog/categories/_year", {}); // => "music" (we skipped two route nodes here)
```
<!-- tabs:end -->
