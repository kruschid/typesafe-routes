# Parameter binding

The `bind` method can be used for a clearer assignment between routes and parameters. The `bind` method creates a new context that can be passed around without rendering. Eventually, a route can be rendered with the `render` method, which can be chained after binding.

``` ts
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
```

<!-- tabs:start -->

## **Basic Usage**

``` ts
routes
  .bind("blog/categories", {
    path: { category: "movies" },
  })
  .render("year", {
    path: { year: 2024 },
  }); // => "/blog/categories/movies/year/2024"
```

## **Relative Routes**

``` ts
routes
  .bind("blog/_categories", {
    path: { category: "movies" },
  })
  .bind("year", {
    path: { year: 2024 },
  })
  .render(); // => "categories/movies/year/2024"
```

## **Deeply Nested Routes**

``` ts
routes
  .bind("blog")
  .bind("categories", {
    path: { category: "movies" },
  })
  .bind("year", {
    path: { year: 2024 },
  })
  .render(); // => "/blog/categories/movies/year/2024"
```
<!-- tabs:end -->