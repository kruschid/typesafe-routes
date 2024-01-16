<img title="logo" src="logo.png" />

# Typesafe Routes

- 14Kb bundle size
- 11Kb minified
- 2.6Kb gz compressed

Enhance your preferred routing library by incorporating type-safety into string-based route definitions. Allow TypeScript to identify broken links during the compilation process, enabling you to develop easily maintainable software.

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Recursive Conditional Types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#recursive-conditional-types).
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Template Literal Types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#template-literal-types) 
- [Tail-Recursion Elimination on Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types)
  
## Installation (npm/yarn examples)

``` sh
npm i typesafe-routes

# or

yarn add typesafe-routes
```

## Basic Features

<details>
  <summary>Absolute routes</summary>

  ### Absolute routes

  - when using `createRoutes`, define route nodes with a routes object, where property names represent route names.
  - each route may specify a `path` using a string array.
  - the `render` method is versatile, accepting arguments.
  - if arguments are present,
    - the first parameter holds a string path with route names,
    - and the second parameter can be used for passing path or query parameters.
    - refer to other sections for detailed examples illustrating the effective utilization of these features.
  
  ``` ts
  import { createRoutes } from "typesafe-routes";

  const routes = createRoutes({
    home: { // <= route segment name: "home"
      path: ["home"] // <= path segment array
    },
    about: {
      path: ["about-us"]
    },
    blogCategories: {
      path: ["blog", "categories", "all"]
    }
  });

  routes.render(); // => "/"
  routes.render("home", {}); // => "/home"
  routes.render("about", {}); // => "/about-us"
  routes.render("blogCategories", {}); // => "/blog/categories/all"
  ```
</details>

<details>
  <summary>Path parameters</summary>

  ### Path parameters

  - in addition to static path segments, `path` segment arrays in the route definition can accommodate dynamic segments, referred to as parameters.
  - parameters are named, have specific types, and are equipped with parser and serializer implementations to facilitate string conversion.
  - parameters can be designated as `optional`, ensuring that no exceptions are raised if optional parameters are absent during rendering or parsing processes.
  - the example showcases the import of string and integer parameter functions for defining typed parameters.
    - for details on other built-in parameter types, please refer to the relevant section.
    - this modular approach ensures flexibility and adaptability for diverse parameter requirements.

  ``` ts
  import { createRoutes, str, int } from "typesafe-routes";

  const routes = createRoutes({
    blog: {
      path: ["blog", "categories", str("category"), "year", int("year").optional]
    }
  });

  routes.render("blog", {
    path: {category: "movies"}
  }); // => "/blog/categories/movies/year"

  routes.render("blog", { path: {
    category: "movies",
    year: 2024,
  }}); // => "/blog/categories/movies/year/2024"
  ```

</details>

<details>
  <summary>Nested routes</summary>

  ### Nested routes

  - route segments can be nested using the `children` propery containing an object with other route segments
  - `render` method takes a path as the first argument containing route segment names separated by a slash `/` character
  - if provided multiple segment names all the corresponding parameters have to be provided as the second argument combined in one object
    - the overview can suffer from this so consult the other sections to learn more about how to assign parameters to segments using the `bind` method

  - Nested route segments are achieved through the `children` property, containing an object with additional route segments.
  - The `render` method's first argument is a path with route segment names separated by a slash `/`.
  - When supplying multiple segment names, include all corresponding parameters in the second argument as a unified object.
    - For improved clarity in assigning parameters, refer to other sections for guidance on utilizing the `bind` method.

  ``` ts
  import { createRoutes, oneOf, int } from "typesafe-routes";

  const blogCat = oneOf("all", "art", "movies");

  const routes = createRoutes({
    home: {
      path: ["home"]
    },
    blog: {
      path: ["blog"],
      children: { // <= indicates nested routes 
        categories: {
          path: ["categories", blogCat("category")],
          children: {  // <= indicates nested routes 
            year: {path: ["year", int("year")]},
          }
        }
      }
    }
  });

  routes.render("blog", {}); // => "/blog"

  routes.render("blog/categories", { path: {
    category: "movies"
  }}); // => "/blog/categories/movies"
  
  routes.render("blog/categories/year", { path: {
    category: "all",
    year: 2024
  }}); // => "/blog/categories/all/year/2024"
  ```
</details>

<details>
  <summary>Relative routes</summary>

  ### Relative routes

  - You can create relative routes by prefixing a route segment with an underscore `_` within the `render` method's path argument.
  - The relative path returned begins without a leading `/` character and excludes any route segments specified before the `_`.
  - You can modify this default behavior using a custom renderer. Refer to the customization section for more examples.

  ``` ts
  import { createRoutes, oneOf, int } from "typesafe-routes";

  const blogCat = oneOf("all", "art", "movies");

  const routes = createRoutes({
    home: {
      path: ["home"]
    },
    blog: {
      path: ["blog"],
      children: {
        categories: {
          path: ["categories", blogCat("category")],
          children: {
            year: {path: ["year", int("year")]},
          }
        }
      }
    }
  });

  routes.render("blog/categories", { path: {
    category: "art"
  }}); // => "/blog/categories/art" (an absolute path with a leading "/")

  routes.render("blog/_categories", { path: {
    category: "art"
  }}); // => "categories/art" (a relative path without the leading "/blog" path segment)
  
  routes.render("blog/_categories/year", { path: {
    category: "movies",
    year: 2024
  }}); // => "categories/movies/year/2024"

  routes.render("blog/categories/_year", { path: {
    year: 2024
  }}); // => "year/2024" (we skipped two route segments here)
  ```

</details>

<details>
  <summary>Templates</summary>

  ### Templates

  - Use the `template` method to generate templates for routers like react-router, vue-router, or Angular router.
  - The `template` method requires a path parameter to define the route segments to render.
  - Absolute route templates are rendered with a leading `/` by default.
  - Render relative route templates with an `_` prefix, similar to how relative routes are rendered with the `render` method.
  - Dynamic segments or parameters are rendered with a colon `:` prefix
  - Optional parameters are indicated with a `?` suffix in the resulting template
  - For edge cases like wildcards (`**` in Angular routes) or star sign (`*` in react router), use the pass-through `template` property to pass any string to the resulting template.
  - Only the `template` method can render route segments with a `template` property; `render` ignores them.
  - You can personalize template rendering using a custom renderer. For examples, refer to the customization section.

  ``` ts
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
          template: "**" // pass through property
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

</details>
  
<details>
  <summary>Query parameters</summary>

  ### Query parameters

  - Define query parameters by setting a `query` property in a route segment
  - Make `query` parameters `optional` to avoid mandatory inclusion
  - If an `optional` query parameter is missing during parsing, no exception will be thrown
  - The `render` method concatenates the entire query string following the location path.
  - Pass query parameters to the `render` method using the second argument, which should be an object containing a `query` property.
  - Query parameters are fully compatible with relative paths.

  ``` ts
  import { createRoutes, str, int } from "typesafe-routes";

  const routes = createRoutes({
    home: {
      path: ["home"]
    },
    blog: {
      path: ["blog"],
      children: {
        categories: {
          path: ["categories", str("category")],
          query: [str("search"), int(page).optional]
          children: {
            year: {
              path: ["year", int("year")],
              query: [str("filter").optional]
            },
          }
        }
      }
    }
  });

  routes.render("blog/categories", {
    path: { category: "movies" },
    query: { search: "batman" }
  }); // => "/blog/categories/movies?search=batman"

  routes.render("blog/categories", {
    path: { category: "movies" },
    query: { search: "robocop", page: 4 }
  }); // => "/blog/categories/movies?search=robocop&page=4"

  routes.render("blog/categories/year", {
    path: { category: "movies", year: 2024 },
    query: { search: "batman", page: 0, filter: "joker" }
  }); // => "/blog/categories/movies/year/2024?search=batman&page=0&filter=joker"

  routes.render("blog/categories/_year", {
    path: { year: 2024 },
    query: { filter: "joker" }
  }); // => "year/2024?filter=joker
  ```
</details>

<details>
  <summary>Parameter parsing</summary>

  ### Path parameter parsing

  ``` ts
  import { createRoutes, int, str, date } from "typesafe-routes";

  const routes = createRoutes({
    blog: {
      path: ["blog", int("blogId")],
      children: {
        categories: {
          path: ["category", str("catId").optional],
          children: {
            date: {
              path: ["date", date("date")],
            },
          }
        }
      }
    }
  });

  routes.parseParams("blog/category/date", {
    blogId: "35",
    catId: "x546f23x",
    date: "2023-12-28",
  }); // => { blogId: 35, catId: "x546f23x", date: Date("2023-12-28T00:00:00.000Z") }

  routes.parseParams("blog/_category/date", {
    catId: "x546f23x",
    date: "2023-12-28",
  }); // => { catId: "x546f23x", date: Date("2023-12-28T00:00:00.000Z") }

  routes.parseParams("blog/category/_date", {
    date: "2023-12-28",
  }); // => { date: Date("2023-12-28T00:00:00.000Z") }

  routes.parseParams("blog/_category", {}); // => { }
  ```

  ### Query parameter parsing

  ``` ts
  import { createRoutes, bool, date } from "typesafe-routes";

  const routes = createRoutes({
    blog: {
      path: ["blog"],
      children: {
        categories: {
          path: ["category"],
          query: [str("catId").optional]
          children: {
            options: {
              query: [date("date"), bool("showModal")]
            },
          }
        }
      }
    }
  });

  route.parseQuery("blog/category", { catId: "x546f23x" }); // => { catId: "x546f23x" }

  route.parseQuery("blog/category/options", {
    date: "2023-12-28",
    showModal: "false",
  }); // => { date: Date("2023-12-28T00:00:00.000Z"), showModal: false }

 ```

</details>
  
<details>
  <summary>Parameter binding</summary>

  ### Parameter binding

  - Use `bind` method for clearer assignment between routes and parameters
  - `bind` creates a new route context that can be passed around
  - Supports underscore prefix `_` for relative routes
  - To render the path the `render` method can be chained after binding your parameters

  ``` ts
  import { createRoutes, str, int } from "typesafe-routes";

  const routes = createRoutes({
    blog: {
      path: ["blog"],
      children: {
        categories: {
          path: ["categories", str("category")],
          children: {
            year: {
              path: ["year", int("year")],
            },
          }
        }
      }
    }
  });

  routes
    .bind("blog/categories", {
      path: { category: "movies" },
    })
    .bind("year", {
      path: { year: 2024 },
    })
    .render(); // => "/blog/categories/movies/year/2024"

  routes
    .bind("blog/_categories", {
      path: { category: "movies" },
    })
    .bind("year", {
      path: { year: 2024 },
    })
    .render(); // => "categories/movies/year/2024"

  routes
    .bind("blog")
    .bind("categories", {
      path: { category: "movies" },
    })
    .render("year", {
      path: { year: 2024 },
    }); // => "/blog/categories/movies/year/2024"

  ```
</details>

## Advanced Features 

<details>
  <summary>Extend string paths</summary>

  - use this if you want to build a typesafe path based on an existing string path
  - string path can be extended partially by using the relative route prefix `_` (underscore) 
  - path and query parameters in the string path can be overridden
   
</details>
  
<details>
  <summary>Replace dynamic segments</summary>

  - use this if you want to replace specific dynamic segments in a string path
  - absolute paths can be converted into relative parts with the underscore `_` prefix

</details>

<details>
  <summary>Parameter types</summary>

  - string
  - float
  - date
  - bool
  - oneOf
  - list
  - json
  - base64
  - uvm

</details>

## Customization

<details>
  <summary>Custom parameter types</summary>
</details>

<details>
  <summary>Path renderering</summary>
</details>

<details>
  <summary>Template renderering</summary>
</details>

---

## Coffee to code transpiler

You can make a difference and enhance the quality of this project by not only reporting issues and submitting pull requests, but also by treating me to a fresh cup of coffee as a token of appreciation for my efforts.

<a href="https://www.buymeacoffee.com/kruschid" target="_blank"><img width="200px" src="https://cdn.buymeacoffee.com/buttons/v2/default-orange.png" alt="Buy Me A Coffee" ></a>

## Roadmap

- prevent duplicate param names in route tree 
- react router
  - demo
  - utility components with memo
- refine js demo
- vue router
  - maybe renderer
  - demo
- angular router
  - renderer
  - demo