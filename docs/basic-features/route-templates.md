# Templates

``` ts
import { createRoutes, str } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog"],
    children: {
      "*": {
        template: "**" // pass-through property
      },
      categories: {
        path: ["categories", str("category"), str("year").optional],
      }
    }
  }
});
```

The `template` method generates template strings for routers like react-router, vue-router, or Angular router. The `template` method requires a path parameter to define the route nodes to render.

<!-- tabs:start -->
## **Basic Usage**

With the default renderer absolute route templates are rendered with a leading `/` by default. Dynamic segments or parameters are rendered with a colon `:` prefix. Optional parameters are indicated with a `?` suffix in the resulting template. You can personalize template rendering using a custom renderer. For examples, refer to the customization section.

``` ts
routes.template("blog/categories"); // => "/blog/categories/:category/:year?"
```

## **Relative Routes**

Render relative route templates with an `_` prefix, similar to how relative routes are rendered with the `render` method.

``` ts
routes.template("blog/categories"); // => "/blog/categories/:category/:year?"
routes.template("blog/_categories"); // => "categories/:category/:year?"
```

## **Pass-Through Property**

For some edge cases like wildcards (`**` in Angular routes) or the star sign (`*` in react router), use the pass-through `template` property to pass any string to the resulting template. Only the `template` method can render route segments with a `template` property; `render` ignores them.

``` ts
routes.template("blog/*"); // => "/blog/**"
```
<!-- tabs:end -->