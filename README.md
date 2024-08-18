![](https://badgen.net/bundlephobia/minzip/typesafe-routes@next)
![](https://badgen.net/bundlephobia/min/typesafe-routes@next)
![](https://badgen.net/bundlephobia/tree-shaking/typesafe-routes@next)

# Typesafe Routes

Enhance your preferred routing library by incorporating powerful path generation including:

- Path & template rendering
- Nested, absolute, and relative paths
- Parameter parsing and serialization
- Type-safe, customizable, and extendable
- Also works with JavaScript (apart from type safety)

## Example (Default Renderer)

``` ts
import { createRoutes, int } from "typesafe-routes";

const routes = createRoutes({
  users: {
    path: ["users"],
    children: {
      create: { path: ["create"] }
      edit: { path: ["edit", int("uid")] },
      show: {
        path: ["show", int("uid")],
        children: {
          groups: { path: ["groups", int.optional("gid")] }
        }
      },
    }
  }
});

// absolute paths
routes.users.$render({}); // => "/users"
routes.users.create.$render({}); // => "/users/create"
routes.users.show.$render({path: {uid: 123}}); // => "/users/show/123"

// relative paths ("_" indicates the start segment)
routes._.users.$render({}); // => "users"
routes.users._.create.$render({}); // => "create"
routes.users._.show.$render({path: {uid: 321}}); // => "show/321"

// parse path params
routes.users.show.$parseParams({uid: "42"}); // => {uid: 42}
routes.users.show.$parseParams("/users/show/99"); // => {uid: 99}
routes.users._.show.$parseParams("show/99"); // => {uid: 99}

// create from location string
routes
  .users
  .show
  .$from("/users/show/1", {path: {uid: 11}}) // replaces parameters 
  .groups
  .$render({path: {gid: 2}}); // => "/users/show/11/groups/2"

// templates 
routes.users.show.groups.$template(); // => "/users/show/:uid/groups/:gid?"
routes._.users.show.groups.$template(); // => "users/show/:uid/groups/:gid?"
routes.users._show.groups.$template(); // => "show/:uid/groups/:gid?"

// template examples with a custom renderer
routes.users.show.groups.$template(); // => "users/show/{:uid}/groups/{:gid}"

// array based custom templates:
routes.users.show.$template(); // => ["users", "show", {name: "uid", type: "number"}]
```

## Quick Reference

The complete [documentation can be found here](https://kruschid.github.io/typesafe-routes).

- Methods
  - `$render`: renders a path with parameters
  - `$template`: renders a route template
  - `$parseParams`: parses dynamic segments in a path
  - `$parseQuery`: parses parameters in a search query
- Chainable operators:
  - `$bind`: binds parameters to a path for later rendering
  - `$from`: creates a new path based on a string-based path (i.e. `location.path`)
  - `$replace`: replaces segments in a string-based path (i.e. `location.path`)
  
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
  - refinejs
  - vue router
  - angular router

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
  - [x] extend-string-location
  - [x] replace-dynamic-segments
  - [ ] global-query-parameters
- customization
  - [x] custom-parameter-types
  - [x] custom-template-rendering
  - [x] custom-path-rendering
- tutorials
  - [ ] angular router
  - [ ] react router
  - [ ] vue router
  - [ ] refine
