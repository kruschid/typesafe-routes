# Templates

The `$template` method is capable of generating template path strings (like `"projects/:projectId/tasks/:taskId"`) that can be used with routers such as [React Router](https://reactrouter.com), [Vue Router](https://router.vuejs.org/), [Angular Router](https://angular.dev/guide/routing), and more.

Given the following route tree with a parent node `blog` and a child `categories`:

``` ts
import { createRoutes, str } from "typesafe-routes";

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

With the default renderer absolute path templates are rendered with a leading `/` by default. Dynamic segments or parameters are rendered with a colon `:` prefix. Optional parameters are indicated with a `?` suffix in the resulting template. You can personalize template rendering using a custom renderer. For examples, refer to the [Custom Template Rendering](customization/custom-template-rendering.md) section.

``` ts
routes.blog.categories.$template(); // => "/blog/categories/:category/:year?"
```

### **Relative Paths**

Initiate relative route templates with an `_` link, similar to how [Relative Routes](basic-features/relative-routes.md) are rendered with the `$render` method.

``` ts
routes.blog.categories.$template(); // => "/blog/categories/:category/:year?"
routes.blog._.categories.$template(); // => "categories/:category/:year?"
```

<!-- tabs:end -->

## Template Property

In the examples above, templates are created automatically by a [render function](customization/custom-template-rendering.md). However, in some edge cases, overriding certain segments in the rendered templates might be necessary. This could be because you want to use advanced features of your routing library, such as wildcards or [regex statements for parameters](https://github.com/lukeed/regexparam). For these use cases, the template property comes in handy.

The following example shows a route tree with a parent node `blog` and the three children: `*`, `categories`, and `movies`.


``` ts
const routes = createRoutes({
  blog: {
    path: ["blog"],
    children: {
      "*": {
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
For some edge cases like wildcards (`**` in [Angular Router](https://v17.angular.io/guide/router#setting-up-wildcard-routes)) or the star sign (`*` in [React Router](https://reactrouter.com/en/main/route/route#splats)), use the pass-through `$template` property to pass any string to the resulting template. Only the `$template` method can render route segments with a `template` property; `$render` ignores them.

``` ts
routes.blog["*"].$template(); // => "/blog/**"
```

The second example renders a template for the categories route. Note that we also specified a path `["categories", str("cid")]` to make the template compatible with other methods such as `$render`, `$parseParams`, etc.

``` ts
routes.blog.categories.$template(); // => "/blog/categories/:cid-(movies|music|art)"
```

### **Parameter Templates**

We can also assign templates to parameters individually. In our route definition, we specified the title parameter with `str("title", { template: ":title.(mp4|mov)" })`. The template property is set to `":title.(mp4|mov)"` to limit the file extension to either `mp4` or `mov`.

``` ts
routes.blog.movies.$template(); // => "/blog/movies/:title.(mp4|mov)"
```
<!-- tabs:end -->
