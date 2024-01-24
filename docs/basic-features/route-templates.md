# Templates

- Use the `template` method to generate templates for routers like react-router, vue-router, or Angular router.
- The `template` method requires a path parameter to define the route segments to render.
- Absolute route templates are rendered with a leading `/` by default.
- Render relative route templates with an `_` prefix, similar to how relative routes are rendered with the `render` method.
- Dynamic segments or parameters are rendered with a colon `:` prefix
- Optional parameters are indicated with a `?` suffix in the resulting template
- For edge cases like wildcards (`**` in Angular routes) or star sign (`*` in react router), use the pass-through `template` property to pass any string to the resulting template.
- Only the `template` method can render route segments with a `template` property; `render` ignores them.
- You can personalize template rendering using a custom renderer. For examples, refer to the customization section.

``` js
import { createRoutes, oneOf, int } from "typesafe-routes";

const blogCat = oneOf("all", "art", "movies");

const routes = createRoutes({
  home: {
    path: ["home"]
  },
  blog: {
    path: ["blog"],
    children: {
      "*": {
        template: "**" // pass-through property
      },
      categories: {
        path: ["categories", blogCat("category")],
        children: {
          year: {path: ["year", int("year").optional]},
        }
      }
    }
  }
});

routes.template("home"); // => "/home"

routes.template("blog/categories"); // => "/blog/categories/:category"
routes.template("blog/categories/year"); // => "/blog/categories/:category/year/:year?"
routes.template("blog/_categories/year"); // => "categories/:category/year/:year?"
routes.template("blog/categories/_year"); // => "year/:year?"

routes.template("blog/*"); // => "/blog/**"
```