# Parameter binding

- Use `bind` method for clearer assignment between routes and parameters
- `bind` creates a new route context that can be passed around
- Supports underscore prefix `_` for relative routes
- To render the path the `render` method can be chained after binding your parameters

``` js
import { createRoutes, str, int } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog"],
    children: {
      categories: {
        path: ["categories", str("category")],
        children: {
          year: {
            path: ["year", int("year")],
          },
        }
      }
    }
  }
});

routes
  .bind("blog/categories", {
    path: { category: "movies" },
  })
  .bind("year", {
    path: { year: 2024 },
  })
  .render(); // => "/blog/categories/movies/year/2024"

routes
  .bind("blog/_categories", {
    path: { category: "movies" },
  })
  .bind("year", {
    path: { year: 2024 },
  })
  .render(); // => "categories/movies/year/2024"

routes
  .bind("blog")
  .bind("categories", {
    path: { category: "movies" },
  })
  .render("year", {
    path: { year: 2024 },
  }); // => "/blog/categories/movies/year/2024"
```