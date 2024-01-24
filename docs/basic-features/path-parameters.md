# Path parameters

- in addition to static path segments, `path` segment arrays in the route definition can accommodate dynamic segments, referred to as parameters.
- parameters are named, have specific types, and are equipped with parser and serializer implementations to facilitate string conversion.
- parameters can be designated as `optional`, ensuring that no exceptions are raised if optional parameters are absent during rendering or parsing processes.
- the example showcases the import of string and integer parameter functions for defining typed parameters.
  - for details on other built-in parameter types, please refer to the relevant section.
  - this modular approach ensures flexibility and adaptability for diverse parameter requirements.

``` js
import { createRoutes, str, int } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog", "categories", str("category"), "year", int("year").optional]
  }
});

routes.render("blog", {
  path: {category: "movies"}
}); // => "/blog/categories/movies/year"

routes.render("blog", { path: {
  category: "movies",
  year: 2024,
}}); // => "/blog/categories/movies/year/2024"
```
