# Nested routes

- route segments can be nested using the `children` propery containing an object with other route segments
- `render` method takes a path as the first argument containing route segment names separated by a slash `/` character
- if provided multiple segment names all the corresponding parameters have to be provided as the second argument combined in one object
  - the overview can suffer from this so consult the other sections to learn more about how to assign parameters to segments using the `bind` method
- Nested route segments are defined through the `children` property, containing an object with additional route segments.
- The `render` method's first argument is a path with route segment names separated by a slash `/`.
- When supplying multiple segment names, include all corresponding parameters in the second argument as a unified object.
  - For improved clarity in assigning parameters, refer to other sections for guidance on utilizing the `bind` method.

``` js
import { createRoutes, oneOf, int } from "typesafe-routes";

const blogCat = oneOf("all", "art", "movies");

const routes = createRoutes({
  home: {
    path: ["home"]
  },
  blog: {
    path: ["blog"],
    children: { // <= indicates nested routes 
      categories: {
        path: ["categories", blogCat("category")],
        children: {  // <= indicates nested routes 
          year: {path: ["year", int("year")]},
        }
      }
    }
  }
});

routes.render("blog", {}); // => "/blog"

routes.render("blog/categories", { path: {
  category: "movies"
}}); // => "/blog/categories/movies"

routes.render("blog/categories/year", { path: {
  category: "all",
  year: 2024
}}); // => "/blog/categories/all/year/2024"
```