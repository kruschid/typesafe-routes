![minzipped size](https://badgen.net/bundlephobia/minzip/typesafe-routes@next)
![minified size](https://badgen.net/bundlephobia/min/typesafe-routes@next)
![tree shaking](https://badgen.net/bundlephobia/tree-shaking/typesafe-routes@next)
[![discord link](https://img.shields.io/badge/Chat%20on-Discord-%235865f2)](https://discord.gg/MnzrbHYN)

# Typesafe Routes

`typesafe-routes` helps you to accelerate your app development and reduce your test efforts by incorporating the TypeScript compiler for advanced type checking. Don't look for broken router paths manually; instead, let TypeScript notify you about inconsistencies in your routes.

`typesafe-routes` features include:

- Autocompletion for paths and parameters 
- Path & template rendering
- Nested, absolute, and relative path rendering
- Parameter parsing and serialization
- Type-safe, customizable, and extendable
- Compatible with JavaScript (apart from type safety)
- Small bundle size starting at less than 1kb

## Example (Default Renderer)

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
renderPath(routes._.users.$render, { uid: 123 }); // ~> "users/123"
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

> Version 12 is currently under development. Please don't use it in production yet. The official release will happen soon. [The v10 documentation can be found here](https://github.com/kruschid/typesafe-routes/tree/v10.0.6).

``` sh
npm i typesafe-routes@next # or any npm alternative
```

## How to Contribute

- leave a star ⭐
- report a bug 🐞
- open a pull request 🏗️
- help others ❤️
- [buy me a coffee ☕](https://www.buymeacoffee.com/kruschid)
  
<a href="https://www.buymeacoffee.com/kruschid" target="_blank"><img width="200px" src="https://cdn.buymeacoffee.com/buttons/v2/default-orange.png" alt="Buy Me A Coffee" ></a>

## Roadmap
  
- v12 migration guide
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
  - [ ] angular router
  - [ ] react router
  - [ ] wouter
  - [ ] vue router
  - [ ] refine
