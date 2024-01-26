# Extending String Location

The `extend` method creates paths based on an existing location path (such as `location.pathname` and `location.search`) in a typesafe manner. 

Example: Extending a path, such as `/groups/42` to `/groups/42/users/24`, and possibly changing the parameter in the second segment to render `/groups/1337/users/24`, without compromising typesafety.

``` js
import { createRoutes, int } from "typesafe-routes";

const routes = createRoutes({
  groups: {
    path: ["groups", int("gid")],
    query: [int(page).optional],
    children: {
      users: {
        path: ["users", int("uid").optional],
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

Here, we compose and render a new path that is based on an existing path. `from` creates a new context for the given `locationPath` based on the route nodes specified in the first argument. The final argument is for passing new parameter values that will override those in the provided path.

``` js
// location.path + location.search
const locationPath = "/groups/42?page=7";

routes
  .from("groups", locationPath, {})
  .bind("users", {})
  .render(); // => "/groups/42/users?page=7"

routes
  .from("groups", locationPath, {})
  .bind("users", { path: { uid: 1337 }})
  .render(); // => "/groups/42/users/1337?page=7"
```

## **Nested Routes**

The `from` method can also parse deeply nested paths. In this example, the first argument, `"groups/users"`, contains a path made up of two route nodes.

``` js
// location.path
const locationPath = "/groups/42/users/1337";

routes
  .from("groups/users", locationPath, {})
  .render(); // => "/groups/42/users/1337"
```

## **Relative Routes**

`locationPath` contains a relative path that can be parsed by prefixing the route node in the first argument with an underscore `_` sign. After using the `from` method an additional node `settings` is added to the context, and the path is rendered using `render`. 

``` js
// relative location path
const locationPath = "users/1337";
// extends relative path with bind
routes
  .from("groups/_users", locationPath, {})
  .bind("settings", {})
  .render(); // => "users/1337/settings"
```

## **Parameter Override**

The last argument of the `from` method can be used to selectively override parameter values in a typesafe manner. 

``` js
const locationPath = "/groups/42/users/1337?page=7";
// extends relative path with bind
routes
  .from("groups/users", locationPath, {
    path: {uid: 42},
    query: {page: 4},
  })
  .render(); // => "/groups/42/users/42?page=4"
```

## **Parameter Deletion**

Optional parameters can be deleted by setting their value to `undefined`
 
``` js
const locationPath = "/groups/42/users/24?page=7"

routes.from("groups/users", locationPath, {
  path: { uid: undefined },
  query: { page: undefined },
})
.render(); // => "/groups/42/users"
```

## **Extra Segments**

If the location path includes additional segments, the `from` will omit these trailing segments, leaving only the matching path in the context.

However, if the provided location path does not match the route nodes, `from` will throw an `Error`.

``` js
const locationPath = "/groups/42/users/24/extra/segments"

routes.from("groups/users", locationPath, {})
.render(); // => "/groups/42/users/24"
```
<!-- tabs:end -->
