# Base Url


This page shows a sample code fragment that handles scenarios where a base URL needs to be rendered in links.

The code below creates two separate route trees: one for internal application routes without a base URL prefix, and a second route tree that extends the first one by adding a root node with a path segment that holds the application's base URL.

``` ts
import { createRoutes, renderPath } from "typesafe-routes"

// The base URL is hardcoded in this example but could also be set dynamically
const APP_URL = "https://localhost";

const internalRoutes = createRoutes({
  register: {
    path: ["register"],
  },
  ...
});

renderPath(internalRoutes.register, {}) // ~> /register

const externalRoutes = createRoutes({
  baseUrl: {
    path: [APP_URL],
    children: internalRoutes["~routes"],
  },
});

renderPath(externalRoutes.baseUrl.register, {}) // ~> https://localhost/register
```

Both route trees could be exported and utilized as an npm package within a monorepo.
