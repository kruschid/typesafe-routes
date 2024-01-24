# Parameter Parsing

## Path Parameters

- **Type Conversion**: `parseParams` converts path parameter values from a string format to their corresponding types.
- **Framework Compatibility:** Capable of parsing parameters from objects extracted by frameworks such as React-Router or Angular Router.
- **Location paths**: Parsing parameters from string paths (such as `location.pathname`), including:
  - Support for both relative and absolute paths.
  - Ability to handle relative route paths prefixed with `_`.
- **Required Parameters**: Throws if a required parameter is not present.

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

routes.parseParams("blog/categories/date", {
  blogId: "35",
  catId: "x546f23x",
  date: "2023-12-28",
}); // => { blogId: 35, catId: "x546f23x", date: Date("2023-12-28T00:00:00.000Z") }

routes.parseParams("blog/_categories/date", {
  catId: "x546f23x",
  date: "2023-12-28",
}); // => { catId: "x546f23x", date: Date("2023-12-28T00:00:00.000Z") }

routes.parseParams("blog/categories/_date", {
  date: "2023-12-28",
}); // => { date: Date("2023-12-28T00:00:00.000Z") }

routes.parseParams("blog/_categories", {}); // => {}

// with absolute path location
routes.parseParams(
  "blog/categories/date",
  "/blog/35/category/x546f23x/date/2023-12-28"
); // => { blogId: 35, catId: "x546f23x", date: Date("2023-12-28T00:00:00.000Z") }

// with optional parameters
routes.parseParams(
  "blog/categories/date",
  "/blog/35/category/date/2023-12-28"
); // => { blogId: 35, date: Date("2023-12-28T00:00:00.000Z") }

// with relative location path
routes.parseParams(
  "blog/_categories/date",
  "category/date/2023-12-28"
); // => { date: Date("2023-12-28T00:00:00.000Z") }
```

### Query Parameters

- **Type Conversion**: `parseQuery` converts search parameter values from a string format to their corresponding types.
- **Framework Compatibility:** Capable of parsing url query parameters provided by frameworks such as React-Router or Angular Router.
- **Location Search Params**: Parsing parameters from search strings (such as `location.search`), including:
  - Ability to handle relative route paths prefixed with `_`.
  - Skips additional parameters that are not specified by the route path
- **Required Parameters** throw an exception if not present 

``` js
import { createRoutes, str, bool, date } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog"],
    children: {
      categories: {
        path: ["category"],
        query: [str("catId")]
        children: {
          options: {
            query: [date("date"), bool("showModal")]
          },
        }
      }
    }
  }
});

// object search parameters with absolute route path
route.parseQuery("blog/categories", { catId: "x546f23x" }); // => { catId: "x546f23x" }

// object; relative route path
route.parseQuery("blog/categories/_options", {
  date: "2023-12-28",
  showModal: "false",
}); // => { date: Date("2023-12-28T00:00:00.000Z"), showModal: false }

// string; absolute route path
route.parseQuery(
  "blog/categories/options",
  "?catId=x546f23x&date=2023-12-28&showModal=false"
); // => { catId: "x546f23x", date: Date("2023-12-28T00:00:00.000Z"), showModal: false }

// string; relative route path
route.parseQuery(
  "blog/categories/_options",
  "?date=2023-12-28&showModal=false"
); // => { date: Date("2023-12-28T00:00:00.000Z"), showModal: false }

// ignores addional parameters 
route.parseQuery(
  "blog/categories",
  "?catId=x546f23&a=123&b=456" // "a" and "b" are not in the result object
); // => { catId: "x546f23x" }
```