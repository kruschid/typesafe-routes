# Replace dynamic segments

The `replace` function re-renders an existing string location with modified parameter values. For example, given the location `/groups/42/users/1337`, the `replace` function could be used to change the first dynamic segment from `42` to `24` to create the new path `/groups/24/users/1337`.

``` ts
import { createRoutes, int } from "typesafe-routes";

const routes = createRoutes({
  groups: {
    path: ["groups", int("gid")],
    query: [int.optional("page")],
    children: {
      users: {
        path: ["users", int.optional("uid")],
      }
    }
  }
});
```

<!-- tabs:start -->
## **Basic Usage**

In the provided path, one dynamic segment is altered while the other trailing segments remain unchanged. One of the provided search parameters has been modified while the other one stays the same. The `replace` function doesn't omit unknown query parameters, which is why the `offset` parameter is part of the returned string despite not being specified in the route tree above.

``` ts
const locationPath = "/groups/32/extra/segments?page=2&offset=2";

replace(routes.groups, locationPath, {
  path: { gid: 1337 },
  query: { page: 7 },
}) // ~> "/groups/1337/extra/segments?page=7&offset=2"
```

## **Nested Routes**

The `replace` function allows the simultaneous replacement of multiple nested routes. Here we only change dynamic segments that belong to `group` and `users`. The trailing segments remain unchanged even though they are not present in the route tree.

``` ts
const locationPath = "/groups/32/users/33/extra/segments";

replace(routes.group.users, locationPath, {
  path: { gid: 1337, uid: 666 },
}) // ~> "/groups/1337/users/666/extra/segments"
```

## **Relative Routes**

The `replace` function is fully compatible with the underscore `_` link for modifying a relative subpath.

``` ts
const locationPath = "users/32/extra/segments"; // the source is a relative path

replace(routes.groups._.users, locationPath, {
  path: { uid: 1337 },
}) // ~> "users/1337/extra/segments"
```

## **Parameter Deletion**

To remove an optional parameter from the resulting path, simply assign `undefined` to it.

``` ts
const locationPath = "/groups/42/users/32/extra/segments";

replace(routes.groups.users, locationPath, {
  path: { uid: undefined },
}) // => "/groups/42/users/extra/segments"
```

> [!WARNING]
> Removing a required parameter value will throw an exception.
<!-- tabs:end -->
