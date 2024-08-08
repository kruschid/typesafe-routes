# Parameter binding

The `$render` method aggregates all parameters for every route node in the sequence. However, there are times when identifying the parameter associated with each node can prove challenging. Furthermore, in certain instances, the route may be shared among various components, resulting in a multi-step build-up process. To manage these situations more efficiently, the `$bind` method can be invoked for streamlining the binding of parameters for later rendering. This also simplifies the correlation between specific routes and their corresponding parameters.

Internally, the `$bind` method generates a new context that can be shared or moved between different components before it is rendered by the `$render` method.

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
routes.blog
  .categories.$bind({ path: { category: "movies" }})
  .year
  .$render({ path: { year: 2024 }}); // => "/blog/categories/movies/year/2024"
```

## **Multiple Binds**

``` ts
routes.blog
  .categories.$bind({ path: { category: "movies" }})
  .year.$bind({ path: { year: 2024 } })
  .$render({}); // => "/blog/categories/movies/year/2024"
```

## **Relative Routes**

``` ts
routes.blog
  ._
  .categories.$bind({ path: { category: "movies" }})
  .year.$bind("year", {path: { year: 2024 }})
  .$render({}); // => "categories/movies/year/2024"
```
<!-- tabs:end -->