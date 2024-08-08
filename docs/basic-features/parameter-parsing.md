# Parameter Parsing

This section explains how to parse path and query parameter values. Parsing converts string values into their corresponding types that were specified in the route tree. These values may originate from various sources. For instance, they can be in the form of an object provided by router libraries such as [React Router](https://reactrouter.com). Alternatively, they might come from the global [Location](https://developer.mozilla.org/en-US/docs/Web/API/Location) object as a string. This flexibility allows for effective handling of parameter values regardless of their source.

## Path Parameters

Path parameter values are dynamic segments in a location path. For example, if we look at the path `"/blog/35/category/movies/date/2023-12-28"` using the route definition below, we can find three dynamic segments: `"35"`,`"movies"`, and `"2023-12-28"`.

``` ts
import { createRoutes, int, str, date } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog", int("blogId")],
    children: {
      categories: {
        path: ["category", str.optional("category")],
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

Frameworks such as [React Router](https://reactrouter.com) provide a [record](https://reactrouter.com/en/main/hooks/use-params#useparams) containing parameter values. These parameters, typically in string format, can be processed using the `$parseParams` method. This method transforms these string values into their respective JavaScript types, enhancing data handling within the application.

``` ts
// this object might be provided by a routing library
const params = {
  blogId: "35",
  category: "movies",
  date: "2023-12-28",
};

routes.blog.categories.date.$parseParams(params); // => { blogId: 35, category: "movies", date: Date("2023-12-28T00:00:00.000Z") }
```

The `params` object's string-based values are all converted to the corresponding type that was previously defined with `createRoutes`.

## **Relative Routes**

`$parseParams` is also able to handle [relative route](basic-features/relative-routes.md) paths initiated with the `_` link.

```js
routes.blog._.categories.date.$parseParams({
  category: "movies",
  date: "2023-12-28",
}); // => { category: "movies", date: Date("2023-12-28T00:00:00.000Z") }

routes.blog.categories._.date.$parseParams({
  date: "2023-12-28",
}); // => { date: Date("2023-12-28T00:00:00.000Z") }
```

## **Absolute Location Path**

Alternatively, parsing parameters from string paths, like `location.pathname`, is also supported.

``` ts
// with absolute path location
routes.blog.categories.date.$parseParams(
  "/blog/35/category/movies/date/2023-12-28" // location.path
); // => { blogId: 35, catId: "movies", date: Date("2023-12-28T00:00:00.000Z") }

// without optional parameters
routes.blog.categories.date.$parseParams(
  "/blog/35/category/date/2023-12-28" // without the "category" parameter
); // => { blogId: 35, date: Date("2023-12-28T00:00:00.000Z") }
```

## **Relative Location Path**

It is also possible to parse parameters from [relative route](basic-features/relative-routes.md) paths that are initiated with `_`.

```js
// with relative location path
routes.blog._.categories.date.$parseParams(
  "category/date/2023-12-28"
); // => { date: Date("2023-12-28T00:00:00.000Z") }
```
<!-- tabs:end -->

### Query Parameters

The `$parseQuery` method converts [search parameter](https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams) values from string format to their corresponding types. It takes one argument that is the source, which contains the string-based parameter values that need to be parsed. A source can be an object with string values `{name: "value",...}` or a search string `"?name=value&..."`.

``` ts
import { createRoutes, int, bool, date } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog"],
    query: [int("page")]
    children: {
      categories: {
        path: ["category"],
        query: [date.optional("date")]
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
``` ts
// this could come from a router library:
const params = { page: "1", showModal: "false" };

route.blog.categories.options.$parseQuery(params); // => { page: 1, showModal: false }
```

## **Relative Routes**

[Relative Routes](basic-features/relative-routes.md) are compatible with the parsing of query parameters, causing `$parseQuery` to parse only those parameters that belong to the routes that are initiated with `_`.

``` ts
route.blog._.categories.options.$parseQuery({
  showModal: "false",
}); // => { showModal: false }
```

## **String-Based Source**

``` ts
// absolute route path
route.blog.categories.options.$parseQuery(
  "?catId=movies&date=2023-12-28&showModal=false"
); // => { catId: "movies", date: Date("2023-12-28T00:00:00.000Z"), showModal: false }

// relative route path
route.blog.categories._.options.$parseQuery(
  "?date=2023-12-28&showModal=false"
); // => { date: Date("2023-12-28T00:00:00.000Z"), showModal: false }
```

## **Unknown Params**

Parameters that are not specified in any of the route nodes will not be included in the parsing result. This means that only parameters defined within the route nodes are processed.

``` ts
// ignores addional parameters 
route.blog.categories.$parseQuery(
  "?page=5&a=123&b=456"
); // => { page: 5 } // does not include "a" and "b" because they are not specified.
```
<!-- tabs:end -->
