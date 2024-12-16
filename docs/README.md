# Typesafe Routes

## Quickstart

### 1. Installation

> This package is currently under development. Please don't use it in production yet. The official release will happen soon.

``` bash
npm install typesafe-routes@next # or any npm alternative
```

### 2. Route Tree Definition

``` ts
import { createRoutes, int } from "typesafe-routes";

const routes = createRoutes({
  groups: {
    path: ["groups", int("gid")],
    children: {
      users: {
        path: ["users", int.optional("uid")],
      }
    }
  }
});
```

### 3. Path Rendering

``` ts
// only required params
renderPath(routes.groups.users, {
  gid: 123,
}); // ~> "/groups/123/users"

// with optional param
renderPath(routes.groups.users, {
  gid: 123,
  uid: 456,
}); // ~> "/groups/123/users/456"
```

### 4. Discover More Features

To access the other examples, use the navigation on the left (if on mobile, click the burger icon in the bottom left corner).
