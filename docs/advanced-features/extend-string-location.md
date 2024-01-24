# Extending String Location

- use the `extend` method if you want to create typesafe paths based on an existing string path (such as `location.pathname` and `location.search`)
- string path can be extended partially by using the relative route prefix `_` (underscore) 
- path and query parameters in the string path can be overridden

``` js
import { createRoutes, int, str, date } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog", int("blogId")],
    children: {
      categories: {
        path: ["category", str("catId").optional],
        children: {
          date: {
            path: ["date", date("date")],
          },
        }
      }
    }
  }
});

// modifies absolute path
  routes.from(
  "blog/categories",
  "/blog/42/category/music",
  { path: { blogId: 1337, catId: "movies" }}, // overrides the blogId and catId parameter values
)
.render(); // => "/blog/1337/category/movies"

// modifies and extends absolute path
routes.from(
  "blog/categories",
  "/blog/42/category/music",
  { path: { blogId: 1337 }},
)
.render( 
  "date",
  { path: { date: new Date("2023-12-28T00:00:00.000Z") }},
); // => "/blog/1337/category/music/date/2023-12-28"

// extends relative path with bind
routes.from(
  "blog/_categories",
  "category/music",
  {}, // no overrides
)
.bind( 
  "date",
  { path: { date: new Date("2023-12-28T00:00:00.000Z") }},
)
.render(); // => "category/music/date/2023-12-28"

// modifies query params
```