# Typesafe Routes

## Quickstart

### 1. Dependency Installation
``` sh
npm install typesafe-routes
```

### 2. Route Tree Definition

``` js
import { createRoutes, int } from "typesafe-routes";

const routes = createRoutes({
  groups: {
    path: ["groups", int("gid")],
    children: {
      users: {
        path: ["users", int("uid").optional],
      }
    }
  }
});
```

### 3. Path Rendering

``` js
// only required param
routes.render("groups/users", {
  path: { gid: 123 },
}); // => "/groups/123/users"

// with optional param
routes.render("groups/users", {
  path: { gid: 123, uid: 456 },
}); // => "/groups/123/users/456"
```

### 4. Discover More Features

To access the other examples, use the navigation on the left (if on mobile, click the burger icon in the bottom left corner).
