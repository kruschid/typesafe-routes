# Parameter Parsing

## Path Parameters

``` js
import { createRoutes, int, str, date } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog", int("blogId")],
    children: {
      categories: {
        path: ["category", str("category").optional],
        children: {
          date: {
            path: ["date", date("date")],
          },
        }
      }
    }
  }
});
```
<!-- tabs:start -->

## **Parameter Record**

Frameworks such as React Router offer a feature where they supply a record containing parameter values. These parameters, typically in string format, can be efficiently processed using the `parseParams` method. This method transforms these string values into their respective JavaScript types, enhancing data handling within the application.

``` js
// this object might be provided by a routing library
const params = {
  blogId: "35",
  category: "movies",
  date: "2023-12-28",
};

routes.parseParams("blog/categories/date", params); // => { blogId: 35, category: "movies", date: Date("2023-12-28T00:00:00.000Z") }
```

## **Relative Routes**

`parseParams` is also able to handle relative route paths prefixed with `_`.

```js
routes.parseParams("blog/_categories/date", {
  category: "movies",
  date: "2023-12-28",
}); // => { category: "movies", date: Date("2023-12-28T00:00:00.000Z") }

routes.parseParams("blog/categories/_date", {
  date: "2023-12-28",
}); // => { date: Date("2023-12-28T00:00:00.000Z") }
```

## **Absolute Location Path**

Alternatively, parsing parameters from string paths, like `location.pathname`, is also supported.

``` js
// with absolute path location
routes.parseParams(
  "blog/categories/date",
  "/blog/35/category/movies/date/2023-12-28" // location.path
); // => { blogId: 35, catId: "movies", date: Date("2023-12-28T00:00:00.000Z") }

// with optional parameters
routes.parseParams(
  "blog/categories/date",
  "/blog/35/category/date/2023-12-28" // without the "category" parameter
); // => { blogId: 35, date: Date("2023-12-28T00:00:00.000Z") }
```

## **Relative Location Path**

This includes the capability to manage relative route paths that are prefixed with `_`, ensuring flexible and robust route handling.

```js
// with relative location path
routes.parseParams(
  "blog/_categories/date",
  "category/date/2023-12-28"
); // => { date: Date("2023-12-28T00:00:00.000Z") }
```
<!-- tabs:end -->

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
route.parseQuery("blog/categories", { catId: "movies" }); // => { catId: "movies" }

// object; relative route path
route.parseQuery("blog/categories/_options", {
  date: "2023-12-28",
  showModal: "false",
}); // => { date: Date("2023-12-28T00:00:00.000Z"), showModal: false }

// string; absolute route path
route.parseQuery(
  "blog/categories/options",
  "?catId=movies&date=2023-12-28&showModal=false"
); // => { catId: "movies", date: Date("2023-12-28T00:00:00.000Z"), showModal: false }

// string; relative route path
route.parseQuery(
  "blog/categories/_options",
  "?date=2023-12-28&showModal=false"
); // => { date: Date("2023-12-28T00:00:00.000Z"), showModal: false }

// ignores addional parameters 
route.parseQuery(
  "blog/categories",
  "?catId=x546f23&a=123&b=456" // "a" and "b" are not in the result object
); // => { catId: "movies" }
```