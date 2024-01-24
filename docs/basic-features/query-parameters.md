# Query parameters

- Define query parameters by setting a `query` property in a route segment
- Make `query` parameters `optional` to avoid mandatory inclusion
- If an `optional` query parameter is missing during parsing, no exception will be thrown
- The `render` method concatenates the entire query string following the location path.
- Pass query parameters to the `render` method using the second argument, which should be an object containing a `query` property.
- Query parameters are fully compatible with relative paths.

``` js
import { createRoutes, str, int } from "typesafe-routes";

const routes = createRoutes({
  home: {
    path: ["home"]
  },
  blog: {
    path: ["blog"],
    children: {
      categories: {
        path: ["categories", str("category")],
        query: [str("search"), int(page).optional]
        children: {
          year: {
            path: ["year", int("year")],
            query: [str("filter").optional]
          },
        }
      }
    }
  }
});

routes.render("blog/categories", {
  path: { category: "movies" },
  query: { search: "batman" }
}); // => "/blog/categories/movies?search=batman"

routes.render("blog/categories", {
  path: { category: "movies" },
  query: { search: "robocop", page: 4 }
}); // => "/blog/categories/movies?search=robocop&page=4"

routes.render("blog/categories/year", {
  path: { category: "movies", year: 2024 },
  query: { search: "batman", page: 0, filter: "joker" }
}); // => "/blog/categories/movies/year/2024?search=batman&page=0&filter=joker"

routes.render("blog/categories/_year", {
  path: { year: 2024 },
  query: { filter: "joker" }
}); // => "year/2024?filter=joker
```