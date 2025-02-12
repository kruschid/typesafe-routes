![minzipped size](https://badgen.net/bundlephobia/minzip/typesafe-routes)
![minified size](https://badgen.net/bundlephobia/min/typesafe-routes)
![tree shaking](https://badgen.net/bundlephobia/tree-shaking/typesafe-routes)
[![discord link](https://img.shields.io/badge/Chat%20on-Discord-%235865f2)](https://discord.gg/BCGmvSSJBk)

# Typesafe Routes

`typesafe-routes` speeds up app development and cuts down on testing efforts by letting TypeScript catch route and parameter type inconsistencies. Your code will be more robust, making broken links a thing of the past.

`typesafe-routes` features include:

- Autocompletion for paths and parameters 
- Path & template rendering
- Nested, absolute, and relative path rendering
- Parameter parsing and serialization
- Type-safe, customizable, and extendable
- Compatible with JavaScript (apart from type safety)
- Small bundle size starting at less than 1kb

## Example

[typescript playground](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAbzgYygUwIYzQJQgV2wGcAaOYAOxjPQoBM0oAFLACzLAyiLRZnbjZwAGyxo4AXzgAzKBBBwARDACeYNEQzS0AWjmENigNwBYAFDmA9Jbj7sg9OIbTKwGMAgVzyT0Xh2NOABeFHQxPAMiAAoEczg4fB5uAC5EOPi4Tn5UgG1FRMYiRTJKGCj84DpFAEoAXTIM6zhLAu5LZPxK9PjkVmBhOlpU2LMMjLQ6N2HMtlzFCbdFWskGxpsWpKJ2zrpLBZhujIZhNGxprNY549O0JZXm9datjsrLa+xDiXSvswlq0wsZiaGAARkQIMIDDN+ERzLQGMw2FEAkQAHRPMhIHapACMACYAMySf4POAAPwAfEoNoVLPiCYpzFYbBQNNg6NDWLCzPDGHxWMiCMR0ZtUftMQlKrjCcSjKTKdSnnTCXtJjBGTy0PQ+UiUSLCqj3mgJdi4PTZfKqYoaW16W80CdsBrmbYHVhgAA3cQXIhwcoAfUU5HowGQYl9-HEfi47goAHM4Dw4yAtTBqnCtQj+YLIqj-fruCapWaZX85U0FflNsqGRntYj+DnhU882K1Ziy5alPtnUCbJxuN62DMoBgQNyBzxs3qW+LEJK6KlFAAWPFBzsVqlY4uryTmSe8XVCjQFtFz61KgCcl9VixJm-npuve8BTSEYFExDg5nfn7QTZPWc1XvGxKxtZ4dlvdUfzQEQxAAtF8yAtwQPJK0lReXYexguDsAQ09W32VDKx7IA)

``` ts
import { createRoutes, int, renderPath, parsePath, template } from "typesafe-routes";

// route tree definition
const routes = createRoutes({
  users: {
    path: ["users", int("uid")],    // /users/:uid
    children: {
      edit: { path: ["edit"] },     // /users/:uid/edit
      delete: { path: ["delete"] }, // /users/:uid/delete
    }
  }
});

// absolute paths
renderPath(routes.users, { uid: 123 }); // ~> "/users/123"

// nested paths
renderPath(routes.users.edit, { uid: 123 }); // ~> "/users/123/edit"
renderPath(routes.users.delete, { uid: 123 }); // ~> "/users/123/delete"

// relative paths ("_" indicates the starting segment)
renderPath(routes._.users, { uid: 123 }); // ~> "users/123"
renderPath(routes.users._.edit, {}); // ~> "edit"

// parse path params
parsePath(routes.users.edit, { uid: "42" }); // ~> { uid: 42 }
parsePath(routes.users.edit, "/users/99/edit"); // ~> { uid: 99 }

// templates 
template(routes.users.edit); // ~> "/users/:uid/edit"
template(routes._.users.edit); // ~> "users/:uid/edit"
template(routes.users._.edit); // ~> "edit"
```

## Quick Reference

The complete [documentation can be found here](https://kruschid.github.io/typesafe-routes).

- Functions
  - `renderPath`: renders a path with parameters
  - `renderQuery`: renders a search query
  - `render`: renders a path with parameters including query string
  - `template`: renders a route template
  - `parsePath`: parses dynamic segments in a path
  - `parseQuery`: parses parameters in a search query
  - `parse`: parses path and search query for parameters
  - `replace`: partially replaces dynamic segments and query params in a string-based path (i.e. `location.path`)
  
## Installation

``` sh
npm i typesafe-routes # or any npm alternative
```

## How to Contribute

- leave a star ⭐
- report a bug 🐞
- open a pull request 🏗️
  - please discuss your idea on github or discord **before you start working on your PR**
- help others ❤️
- [buy me a coffee ☕](https://www.buymeacoffee.com/kruschid)
  
<a href="https://www.buymeacoffee.com/kruschid" target="_blank"><img width="200px" src="https://cdn.buymeacoffee.com/buttons/v2/default-orange.png" alt="Buy Me A Coffee" ></a>

## Roadmap
  
- v10-v12 migration guide
- v12beta-v12.1 migration guide
- check for duplicate param names in the route tree
- customizable parsing of search params (for example with qs)
- demos & utils
  - react-router
  - wouter
  - vue router
  - angular router
  - refinejs

## Docs

- [x] quickstart
- basic-features
  - [x] absolute-routes
  - [x] parameters
  - [x] nested-routes
  - [x] relative-routes
  - [x] route-templates
  - [x] parameter-parsing
  - [x] parameter-binding
  - [x] parameter-types
- advanced-features
  - [x] replace-dynamic-segments
  - [x] global-query-parameters
- customization
  - [x] custom-parameter-types
- tutorials
  - [x] angular router
  - [ ] react router
  - [ ] wouter
  - [ ] vue router
  - [ ] refine
