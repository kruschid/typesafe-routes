# Replace dynamic segments

This is very similar to the `from` method with the difference that `replace` returns a rendered path including any extra segements an query parameters.

It is intended fur use cases where you want to partially modify a path. For example given the location `/groups/42/users/1337` where you only want to modify the first two segments to render a new path `/groups/24/users/1337`.

It is intended for use cases in which you want to partially modify a path. For example, given the location `/groups/42/users/1337`, you only want to change the first route node to create the new path `/groups/24/users/1337`.

``` js
import { createRoutes, int } from "typesafe-routes";

const routes = createRoutes({
  groups: {
    path: ["groups", int("gid")],
    query: [int(page).optional],
    children: {
      users: {
        path: ["users", int("uid").optional],
      }
    }
  }
});
```

<!-- tabs:start -->
## **Basic Usage**

In the provided path, one dynamic segment is altered while the other trailing segments remain unchanged. The only search parameter has also been modified.

``` js
const locationPath = "/groups/32/extra/segments?page=2&offset=2";

routes.replace("groups", locationPath, {
  path: { gid: 1337 },
  query: { page: 7 },
}) // => "/groups/1337/extra/segments?page=7&offset=2"
```

## **Nested Routes**

`replace` also allows the simultaneous replacement of multiple nested routes. Here we change dynamic segments that belong to `group` and `users`. 

``` js
const locationPath = "/groups/32/users/33/extra/segments";

routes.replace("groups/users", locationPath, {
  path: { gid: 1337, uid: 666 },
}) // => "/groups/1337/users/666/extra/segments"
```

## **Relative Routes**

`replace` is fully compatible with the underscore `_` prefix for indicating a relative route.

``` js
const locationPath = "users/32/extra/segments";

routes.replace("groups/_users", locationPath, {
  path: { uid: 1337 },
}) // => "users/1337/extra/segments"
```

## **Parameter Deletion**

To remove an optional parameter from the resulting path, simply assign `undefined` as a value.

``` js
const locationPath = "/groups/users/32/extra/segments";

routes.replace("groups/users", locationPath, {
  path: { uid: 1337 },
}) // => "users/1337/extra/segments"
```
<!-- tabs:end -->