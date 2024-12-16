# Parameter Parsing

This section explains how to parse path and query parameters. Parsing converts string values into their corresponding types that were specified in the route tree. These values may originate from various sources. For instance, they can be in the form of an object provided by router libraries such as [React Router](https://reactrouter.com). Alternatively, they might come from the global [Location](https://developer.mozilla.org/en-US/docs/Web/API/Location) object as a string. This flexibility allows for effective handling of parameter values regardless of their source.

## Path Parameters

Path parameter values are dynamic segments in a location path. For example, if we look at the path `"/blog/35/category/movies/date/2023-12-28"` using the route definition below, we can find three dynamic segments: `"35"`,`"movies"`, and `"2023-12-28"`.

``` ts
import { createRoutes, int, str, date, parsePath } from "typesafe-routes";

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

### **Parameter Record**

Frameworks such as [React Router](https://reactrouter.com) provide a [record](https://reactrouter.com/en/main/hooks/use-params#useparams) containing parameter values. These parameters, typically in string format, can be processed using the `parsePath` function. This method transforms these string values into their respective JavaScript types, enhancing data handling within the application.

``` ts
// this object might be provided by a routing library
const params = {
  blogId: "35",
  category: "movies",
  date: "2023-12-28",
};

parsePath(routes.blog.categories.date, params);
// ~> {
//   blogId: 35,
//   category: "movies",
//   date: Date("2023-12-28T00:00:00.000Z")
// }
```

The `params` object's string-based values are all converted to the corresponding type that was previously defined with `createRoutes`.

### **Relative Routes**

`parsePath` is also able to handle [relative route](basic-features/relative-routes.md) paths initiated with the `_` link.

``` ts

parsePath(routes.blog._.categories.date, {
  category: "movies",
  date: "2023-12-28",
}); // ~> { category: "movies", date: Date("2023-12-28T00:00:00.000Z") }

parsePath(routes.blog.categories._.date, {
  date: "2023-12-28",
}); // ~> { date: Date("2023-12-28T00:00:00.000Z") }
```

### **Absolute Location Path**

Alternatively, parsing parameters from string paths, like `location.pathname`, is also supported.

``` ts
// with absolute path location
parsePath( 
  routes.blog.categories.date,
  "/blog/35/category/movies/date/2023-12-28" // location.path
); // ~> { blogId: 35, catId: "movies", date: Date("2023-12-28T00:00:00.000Z") }

// omitting optional parameters
parsePath(
  routes.blog.categories.date, 
  "/blog/35/category/date/2023-12-28" // without the "category" parameter
); // ~> { blogId: 35, date: Date("2023-12-28T00:00:00.000Z") }
```

### **Relative Location Path**

It is also possible to parse parameters from [relative route](basic-features/relative-routes.md) paths that are initiated with `_`.

``` ts
// with relative location path
parsePath(
  routes.blog._.categories.date,
  "category/date/2023-12-28"
); // ~> { date: Date("2023-12-28T00:00:00.000Z") }
```
<!-- tabs:end -->

## Query Parameters

The `parseQuery` function converts [search parameter](https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams) values from string format to their corresponding types. It takes one argument that is the source, which contains the string-based parameter values that need to be parsed. A source can be an object with string values `{name: "value",...}` or a search string `"?name=value&..."`.

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

Note that in the example the `options` node is a regular route node but lacks a `path` property, indicating that this node is exclusively used for handling query parameters. 

<!-- tabs:start -->
### **Basic Usage**
``` ts
// this could come from a router library:
const params = { page: "1", showModal: "false" };

parseQuery(route.blog.categories.options, params); // ~> { page: 1, showModal: false }
```

### **Relative Routes**

[Relative Routes](basic-features/relative-routes.md) are compatible with the parsing of query parameters, causing `parseQuery` to parse only those parameters that belong to the routes that are initiated with `_`.

``` ts
parseQuery(route.blog._.categories.options, {
  showModal: "false",
}); // ~> { showModal: false }
```

### **String-Based Source**

``` ts
// absolute route path
parseQuery(
  route.blog.categories.options, 
  "?catId=movies&date=2023-12-28&showModal=false"
); // ~> { catId: "movies", date: Date("2023-12-28T00:00:00.000Z"), showModal: false }

// relative route path
parseQuery(
  route.blog._.categories.options,
  "?date=2023-12-28&showModal=false"
); // ~> { date: Date("2023-12-28T00:00:00.000Z"), showModal: false }
```

### **Unknown Params**

Parameters that are not specified in any of the route nodes will not be included in the parsing result. This means that only parameters defined within the route nodes are processed.

``` ts
// ignores addional parameters 
parseQuery(
  route.blog.categories, 
  "?page=5&a=123&b=456"
); // => { page: 5 } // does not include "a" and "b" because they were not specified with `createRoutes`
```
<!-- tabs:end -->

## Safe Parsing

Parsing libraries, such as [Zod](https://github.com/colinhacks/zod/blob/3032e240a0c227692bb96eedf240ed493c53f54c/README.md#safeparse), provide a method for safe parsing that doesn't trigger an error when validation fails. Typesafe-routes includes similar safe call functions, `safeParsePath`, `safeParseQuery`, and `safeParse`, which return an object containing information about the parsing result.

``` ts
import { safeParseQuery } from "typesafe-routes";

safeParseQuery(route.blog.categories, "?page=5");
// => { success: true; data: { page: 5 }}

safeParseQuery(route.blog.categories, "?offset=10");
// => { success: false; error: Error }
```