# Extending String Location

The `$from` method creates paths based on an existing path string (such as `location.pathname`) in a typesafe manner. 

Example: Extending a path, such as `/groups/42` to `/groups/42/users/24` without compromising typesafety.

``` ts
import { createRoutes, int } from "typesafe-routes";

const routes = createRoutes({
  groups: {
    path: ["groups", int("gid")],
    query: [int.optional(page)],
    children: {
      users: {
        path: ["users", int.optional("uid")],
        children: {
          settings: {
            path: ["settings"]
          }
        }
      }
    }
  }
});
```

<!-- tabs:start -->

## **Basic Usage**

`$from` creates a new path based for the given `locationPath` string.

``` ts
// location.path + location.search
const locationPath = "/groups/42?page=7";

routes
  .goups
  .$from(locationPath, {})
  .users
  .$render({}); // => "/groups/42/users?page=7"
```

The second argument is for passing new parameter values that will override those in the provided path.

``` ts
routes
  .groups
  .$from(locationPath, { path: { gid: 10 } })
  .users
  .$render({ path: { uid: 1337 }}); // => "/groups/10/users/1337?page=7"
```

## **Nested Routes**

The `$from` method can also parse deeply nested paths. In this example `routes.groups.users`, contains a path made up of two route nodes.

``` ts
// location.path
const locationPath = "/groups/42/users/1337";

routes
  .groups
  .users
  .$from(locationPath, {})
  .settings
  .$render({}); // => "/groups/42/users/1337/settings"
```

## **Relative Routes**

In this example `locationPath` contains a relative path that can be parsed by initiating a subroutewith an underscore `_` link. After using the `$from` method an additional node `settings` is added to the context, and the path is rendered using `$render`. 

``` ts
// relative location path
const locationPath = "users/1337";

// extends relative path
routes
  .groups
  ._
  .users
  .$from(locationPath, {})
  .settings
  .$render({}); // => "users/1337/settings"
```

## **Parameter Override**

The last argument of the `$from` method can be used to selectively override parameter values in a typesafe manner. 

``` ts
const locationPath = "/groups/42/users/1337?page=7";
// extends relative path with bind
routes
  .group
  .users
  .$from(locationPath, {
    path: {uid: 24},
    query: {page: 4},
  })
  .$render({}); // => "/groups/42/users/24?page=4"
```

## **Parameter Deletion**

Optional parameters can be deleted by setting their value to `undefined`.
 
``` ts
const locationPath = "/groups/42/users/24?page=7"

routes
  .groups
  .users
  .$from(locationPath, {
    path: { uid: undefined },
    query: { page: undefined },
  })
  .$render({}); // => "/groups/42/users"
```

## **Extra Segments**

If the location path includes additional segments, the `$from` method will omit these trailing segments, leaving only the matching path.

However, if the provided location path does not match the route nodes, `$from` will throw an `Error`.

``` ts
const locationPath = "/groups/42/users/24/extra/segments"

routes
  .groups
  .users
  .$from(locationPath, {})
  .$render({}); // => "/groups/42/users/24"
```
<!-- tabs:end -->
