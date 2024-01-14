<img title="logo" src="logo.png" />

# Typesafe Routes

Enhance your preferred routing library by incorporating type-safety into string-based route definitions. Allow TypeScript to identify broken links during the compilation process, enabling you to develop easily maintainable software.

- [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Recursive Conditional Types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#recursive-conditional-types).
- [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Template Literal Types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#template-literal-types) 
- [Tail-Recursion Elimination on Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types)
- 
- This design provides a seamless and robust handling of dynamic data within the route system.
  
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

  const routes = createRoutes({
    home: {
      path: ["home"]
    },
    blog: {
      path: ["blog"],
      children: { // <= indicates nested routes 
        categories: {
          path: ["categories", oneOf("all", "art", "movies")("category")],
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

  ``` ts
  import { createRoutes, oneOf, int } from "typesafe-routes";

  const routes = createRoutes({
    home: {
      path: ["home"]
    },
    blog: {
      path: ["blog"],
      children: {
        categories: {
          path: ["categories", oneOf("all", "art", "movies")("category")],
          children: {
            year: {path: ["year", int("year")]},
          }
        }
      }
    }
  });

  routes.render("blog/categories", { path: {
    category: "art"
  }}); // => "/blog/categories/art"

  routes.render("blog/_categories", { path: {
    category: "art"
  }}); // => "categories/art"
  
  routes.render("blog/_categories/year", { path: {
    category: "movies",
    year: 2024
  }}); // => "categories/movies/year/2024"

  routes.render("blog/categories/_year", { path: {
    year: 2024
  }}); // => "year/2024"
  ```

</details>

<details>
  <summary>Templates</summary>

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
          template: "**"
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
  <summary>Parameter binding</summary>

  - use `.bind` method for clearer assignment between routes and parameters
  - creates a route context that can be passed around
  - supports underscore prefix _ for relative routes
  - to render the path the `render` method can be chained after binding parameters

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
    .bind("blog/_categories")
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

### Advanced Features 

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

### Customization

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
