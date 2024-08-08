# Templates

The `$template` method generates template strings for routers like [React Router](https://reactrouter.com).

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
        path: ["categories", str("category"), str.optional("year")],
      }
    }
  }
});
```

<!-- tabs:start -->
## **Basic Usage**

With the default renderer absolute route templates are rendered with a leading `/` by default. Dynamic segments or parameters are rendered with a colon `:` prefix. Optional parameters are indicated with a `?` suffix in the resulting template. You can personalize template rendering using a custom renderer. For examples, refer to the [Custom Template Rendering](customization/custom-template-rendering.md) section.

``` ts
routes.blog.categories.$template(); // => "/blog/categories/:category/:year?"
```

## **Relative Routes**

Initiate relative route templates with an `_` link, similar to how [Relative Routes](basic-features/relative-routes.md) are rendered with the `$render` method.

``` ts
routes.blog.categories.$template(); // => "/blog/categories/:category/:year?"
routes.blog._.categories.$template(); // => "categories/:category/:year?"
```

## **Pass-Through Property**

For some edge cases like wildcards (`**` in [Angular Router](https://v17.angular.io/guide/router#setting-up-wildcard-routes)) or the star sign (`*` in [React Router](https://reactrouter.com/en/main/route/route#splats)), use the pass-through `$template` property to pass any string to the resulting template. Only the `$template` method can render route segments with a `$template` property; `$render` ignores them.

``` ts
routes.blog["*"].$template(); // => "/blog/**"
```
<!-- tabs:end -->
