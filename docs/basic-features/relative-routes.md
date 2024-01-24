# Relative routes

- Create relative routes by prefixing a route segment with an underscore `_` within the `render` method's path argument.
- The relative path returned begins without a leading `/` character and excludes any route segments specified before the `_`.
- You can modify this default behavior using a custom renderer. Refer to the customization section for more examples.

``` js
import { createRoutes, oneOf, int } from "typesafe-routes";

const blogCat = oneOf("all", "art", "movies");

const routes = createRoutes({
  home: {
    path: ["home"]
  },
  blog: {
    path: ["blog"],
    children: {
      categories: {
        path: ["categories", blogCat("category")],
        children: {
          year: {path: ["year", int("year")]},
        }
      }
    }
  }
});

routes.render("blog/categories", { path: {
  category: "art"
}}); // => "/blog/categories/art" (an absolute path with a leading "/")

routes.render("blog/_categories", { path: {
  category: "art"
}}); // => "categories/art" (a relative path without the leading "/blog" path segment)

routes.render("blog/_categories/year", { path: {
  category: "movies",
  year: 2024
}}); // => "categories/movies/year/2024"

routes.render("blog/categories/_year", { path: {
  year: 2024
}}); // => "year/2024" (we skipped two route segments here)
```