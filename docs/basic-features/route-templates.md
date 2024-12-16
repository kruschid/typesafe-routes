# Templates

The `template` function is capable of generating template path strings (like `"projects/:projectId/tasks/:taskId"`) that can be used with routers such as [React Router](https://reactrouter.com), [Vue Router](https://router.vuejs.org/), [Angular Router](https://angular.dev/guide/routing), and more.

Given the following route tree with a parent node `blog` and a child `categories`:

``` ts
import { createRoutes, str, template } from "typesafe-routes";

const routes = createRoutes({
  blog: {
    path: ["blog"],
    children: {
      categories: {
        path: ["categories", str("category"), str.optional("year")],
      },
    }
  }
});
```

<!-- tabs:start -->
### **Absolute Paths**

By default absolute path templates are rendered with a leading `/`. Dynamic segments or parameters are rendered with a colon `:` prefix. Optional parameters are indicated with a `?` suffix in the resulting template. You can personalize template rendering using a custom renderer. For examples, refer to the [Custom Template Rendering](customization/custom-template-rendering.md) section.

``` ts
template(routes.blog.categories); // ~> "/blog/categories/:category/:year?"
```

### **Relative Paths**

Initiate relative route templates with an `_` link, similar to how [Relative Routes](basic-features/relative-routes.md) are rendered with the `render` functions.

``` ts
template(routes.blog.categories); // ~> "/blog/categories/:category/:year?"
template(routes.blog._.categories); // ~> "categories/:category/:year?"
```

<!-- tabs:end -->

## Template Property

In the examples above, templates are rendered based on the path definitions in the route tree. However, in some edge cases, overriding certain segments in the rendered templates might be necessary. This could be because you want to use advanced features of your routing library, such as wildcards or [regex statements for parameters](https://github.com/lukeed/regexparam). For these use cases, the `template` property comes in handy.

The following example shows a route tree with a parent node `blog` and the three children: `anything`, `categories`, and `movies`.


``` ts
const routes = createRoutes({
  blog: {
    path: ["blog"],
    children: {
      anything: {
        template: "**"
      },
      categories: {
        path: [
          "categories",
          str("cid")
        ],
        template: "categories/:cid-(movies|music|art)",
      },
      movies: {
        path: [
          "movies",
          str("title", { template: ":title.(mp4|mov)" }),
        ],
      }
    }
  }
});
```

<!-- tabs:start -->
### **Route Templates**
For some edge cases like wildcards (`**` in [Angular Router](https://v17.angular.io/guide/router#setting-up-wildcard-routes)) or the star sign (`*` in [React Router](https://reactrouter.com/start/library/routing#splats)), use the pass-through `$template` property to pass any string to the resulting template. Only the `template` function can render route segments with a `template` property; They are ignored by the `render`, `renderPath`, and `renderQuery` functions.

``` ts
template(routes.blog.wildcard); // ~> "/blog/**"
```

The second example renders a template for the categories route. Note that we also specified a path `["categories", str("cid")]` to make the template compatible with other methods such as `$render`, `$parseParams`, etc.

``` ts
template(routes.blog.categories); // ~> "/blog/categories/:cid-(movies|music|art)"
```

### **Parameter Templates**

We can also assign templates to parameters individually. In our route definition, we specified the title parameter with `str("title", { template: ":title.(mp4|mov)" })`. The template property is set to `":title.(mp4|mov)"` to limit the file extension to either `mp4` or `mov`.

``` ts
template(routes.blog.movies); // ~> "/blog/movies/:title.(mp4|mov)"
```
<!-- tabs:end -->
