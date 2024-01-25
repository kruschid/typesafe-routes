# Parameter Parsing

This section explains how to parse path and query parameter values. Parsing converts string values into their corresponding types that were specified in the route tree. These values may originate from various sources. For instance, they can be in the form of an object provided by router libraries such as React Router. Alternatively, they might come from the global location object as a string. This flexibility allows for effective handling of parameter values regardless of their source.

## Path Parameters

Path parameter values are dynamic segments in a location path. For example, if we look at the path `"/blog/35/category/movies/date/2023-12-28"` using the route definition below, we can find three dynamic segments: `"35"`,`"movies"`, and `"2023-12-28"`.

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

The `parseQuery` method converts search parameter values from string format to their corresponding types. The first argument accepts the route path, which defines the context of the conversion. The second argument is the source, which contains the string-based parameter values that need to be parsed. A source can be an object `{name: "value",...}` or a search string `"?name=value&..."`.

``` js
import { createRoutes, int, bool, date } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog"],
    query: [int("page")]
    children: {
      categories: {
        path: ["category"],
        query: [date("date").optional]
        children: {
          options: {
            query: [bool("showModal")]
          },
        }
      }
    }
  }
});
```

Note that in the example the `options` node lacks a `path` property, indicating that this node is exclusively used for handling query parameters. 

<!-- tabs:start -->
## **Basic Usage**
``` js
// this could come from a router library:
const params = { page: "1", showModal: "false" };

route.parseQuery("blog/categories/options", params); // => { page: 1, showModal: false }
```

## **Relative Routes**
``` js
route.parseQuery("blog/_categories/options", {
  date: "2023-12-28",
  showModal: "false",
}); // => { date: Date("2023-12-28T00:00:00.000Z"), showModal: false }
```

## **String Source**
``` js
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
```

## **Unknown Params**

Parameters that are not specified in any of the route nodes will not be included in the parsing result. This means that only parameters defined within the route nodes are considered and processed, ensuring a focused and relevant parsing outcome.

``` js
// ignores addional parameters 
route.parseQuery(
  "blog/categories",
  "?page=5&a=123&b=456" // "a" and "b" are not in the result
); // => { page: 5 }
```
<!-- tabs:end -->