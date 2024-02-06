# Typesafe Routes

Enhance your preferred routing library by incorporating powerful path generation including:

- Path & template rendering
- Nested, absolute, and relative paths
- Parameter parsing and serialization
- Type-safe, customizable, and extendable
- Also useful with JavaScript

## Quick Reference

The complete [documentation can be found here](https://kruschid.github.io/typesafe-routes).

- Methods
  - `render`: renders a path with parameters
  - `template`: renders a route template
  - `parseParams`: parses dynamic segments in a path
  - `parseQuery`: parses parameters in a search query
- Chainable operators:
  - `bind`: binds parameters to a route for later rendering
  - `from`: creates a new route based on a string-based path (i.e. `location.path`)
  - `replace`: replaces segments in a path
  
## Installation

> Version 11 is currently under development. Please don't use it in production yet. The official release will happen soon. If you want to try typesafe-routes, you can install it right from github:

``` sh
npm i kruschid/typesafe-routes # or any npm alternatives
```

## How to Contribute

- leave a star ⭐
- report a bug 🐞
- open a pull request 🏗️
- help others ❤️
- buy me a coffee ☕
  
<a href="https://www.buymeacoffee.com/kruschid" target="_blank"><img width="200px" src="https://cdn.buymeacoffee.com/buttons/v2/default-orange.png" alt="Buy Me A Coffee" ></a>

## Roadmap

- v11 migration guide
- check for duplicate param names in the route tree
- context caching
- customizable parsing of search params 
- demos & utils
  - react-router
  - refinejs
  - vue router
  - angular router
