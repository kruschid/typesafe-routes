# Parameters

## Path Parameters

In addition to static path segments, `path` segment arrays can also accommodate dynamic segments, referred to as parameters. Parameters are named, have specific types, and are equipped with parser and serializer implementations to facilitate string conversion. Parameters can be designated as `optional`, ensuring that no exceptions are raised if optional parameters are absent during rendering or parsing processes.

The example showcases the import of string (`str`) and integer (`int`) parameter functions for defining typed parameters. For details on other built-in parameter types, please refer to the [Parameter Types](basic-features/parameter-types.md) section.

``` ts
import { createRoutes, str, int } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    // path contains static and dynamic segments (parameters)
    path: ["blog", "categories", str("category"), "year", int.optional("year")]
  }
});
```

<!-- tabs:start -->
### **Required Params Only**
``` ts
routes.blog.$render({
  path: {
    category: "movies",
  },
}); // => "/blog/categories/movies/year"
```

### **With Optional Params**
``` ts
routes.$render("blog", {
  path: {
    category: "movies",
    year: 2024,
  }
}); // => "/blog/categories/movies/year/2024"
```

### **Nested Segments**

When supplying nested segment names, include all parameters in a unified object. For improved clarity in assigning parameters, refer to the [Parameter Binding](basic-features/parameter-binding.md) section for guidance on utilizing the `$bind` method.

``` ts
routes.segmentA.segmentB.$render({
  // unified parameter object for "segmentA" and "segmentB"
  path: {
    paramA: "param-a",
    paramB: "param-b",
  },
}); // => "/segment-a/param-a/segment-b/param-b"
```

<!-- tabs:end -->

## Query parameters

Query parameters can be defined by setting a `query` property in a route node. Query parameters can be made `optional`. If an `optional` query parameter is missing during rendering or parsing, no error will be thrown.

``` ts
import { createRoutes, str, int, bool } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog"],
    query: [str("search"), int.optional(page), bool.optional("filter")]
  }
});
```

Pass the parameter values to the `$render` method, which should be an object containing a `query` property. The `render` method concatenates the entire query string following the location path. Query parameters are fully compatible with Nested Routes](basic-features/nested-routes.md) and [Relative Routes](basic-features/relative-routes.md).

<!-- tabs:start -->
### **Required Params Only**
``` ts
routes.blog.$render({
  query: {
    search: "batman",
  }
}); // => "/blog?search=batman"
```

### **With Optional Params**

``` ts
routes.blog.categories.year.$render({
  query: {
    search: "batman",
    page: 0,
    filter: true,
  }
}); // => "/blog?search=batman&page=0&filter=true"
```

### **Nested Segments**

When supplying nested segment names, include all parameters in a unified object. For improved clarity in assigning parameters, refer to the [Parameter Binding](basic-features/parameter-binding.md) section for guidance on utilizing the `$bind` method.

``` ts
routes.segmentA.segmentB.$render({
  // unified parameter object for "segmentA" and "segmentB"
  path: {
    paramA: "valueA",
    paramB: "valueB",
  },
}); // => "/segment-a/segment-b?paramA=valueA&paramB=valueB"
```

<!-- tabs:end -->