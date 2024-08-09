# Replace dynamic segments

Replacing dynamic segments with `$replace` is very similar to [Extending String Location](advanced-features/extend-string-location.md) with `$from`. The `$from` method returns an object that allows the addition of nodes to a path, whereas the `$replace` method immediately renders the path or subpath with modified parameter values.

It is intended for use cases in which you want to partially modify a path. For example, given the location `/groups/42/users/1337`, you only want to change the first route node to create the new path `/groups/24/users/1337`.

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

In the provided path, one dynamic segment is altered while the other trailing segments remain unchanged. One of the provided search parameters has been modified while the other one stays the same. The `$replace` method doesn't omit unknown query parameters, which is why the `offset` parameter is part of the returned string.

``` ts
const locationPath = "/groups/32/extra/segments?page=2&offset=2";

routes.groups.$replace(locationPath, {
  path: { gid: 1337 },
  query: { page: 7 },
}) // => "/groups/1337/extra/segments?page=7&offset=2"
```

## **Nested Routes**

`$replace` also allows the simultaneous replacement of multiple nested routes. Here we only change dynamic segments that belong to `group` and `users`. The trailing segments remain unchanged even though they are not present in the route tree.

``` ts
const locationPath = "/groups/32/users/33/extra/segments";

routes.group.users.$replace(locationPath, {
  path: { gid: 1337, uid: 666 },
}) // => "/groups/1337/users/666/extra/segments"
```

## **Relative Routes**

The `$replace` method is fully compatible with the underscore `_` link for modifying a relative subpath.

``` ts
const locationPath = "users/32/extra/segments";

routes.groups._.users.$replace(locationPath, {
  path: { uid: 1337 },
}) // => "users/1337/extra/segments"
```

## **Parameter Deletion**

To remove an optional parameter from the resulting path, simply assign `undefined` to it.

``` ts
const locationPath = "/groups/users/32/extra/segments";

routes.groups.users.$replace(locationPath, {
  path: { uid: 1337 },
}) // => "users/1337/extra/segments"
```
<!-- tabs:end -->
