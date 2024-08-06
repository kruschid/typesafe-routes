# Parameters

## Path Parameters

In addition to static path segments, `path` segment arrays can also accommodate dynamic segments, referred to as parameters. Parameters are named, have specific types, and are equipped with parser and serializer implementations to facilitate string conversion. Parameters can be designated as `optional`, ensuring that no exceptions are raised if optional parameters are absent during rendering or parsing processes.

The example showcases the import of string (`str`) and integer (`int`) parameter functions for defining typed parameters. For details on other built-in parameter types, please refer to the relevant section.

``` ts
import { createRoutes, str, int } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    // path contains static and dynamic segments (parameters)
    path: ["blog", "categories", str("category"), "year", int("year").optional]
  }
});
```

<!-- tabs:start -->
### **Required Only**
``` ts
routes.render("blog", {
  path: {
    category: "movies",
  },
}); // => "/blog/categories/movies/year"
```

### **With Optional**
``` ts
routes.render("blog", {
  path: {
    category: "movies",
    year: 2024,
  }
}); // => "/blog/categories/movies/year/2024"
```
<!-- tabs:end -->

## Query parameters

Query parameters can be defined by setting a `query` property in a route segment. Query parameters can be made `optional` to avoid mandatory inclusion. If an `optional` query parameter is missing during rendering or parsing, no exception will be thrown.

``` ts
import { createRoutes, str, int, bool } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog"],
    query: [str("search"), int(page).optional, bool("filter").optional]
  }
});
```

Pass the parameter values to the `render` method using the second argument, which should be an object containing a `query` property. The `render` method concatenates the entire query string following the location path. Query parameters are fully compatible with nested and relative paths.

<!-- tabs:start -->
### **Required Only**
``` ts
routes.render("blog", {
  query: {
    search: "batman",
  }
}); // => "/blog?search=batman"
```

### **With Optional**
``` ts
routes.render("blog/categories/year", {
  query: {
    search: "batman",
    page: 0,
    filter: true,
  }
}); // => "/blog?search=batman&page=0&filter=true"
```
<!-- tabs:end -->