# Global Query Parameters

Global query parameters can be defined by setting the `query` property in the root route and deriving all the remaining routes as children from it.


```ts
import { createRoutes, str, render } from "typesafe-routes";

const routes = createRoutes({
  state: {
    query: [str("state")],
    children: {
      users: {
        path: ["users"]
      }
    }
  },
});
```

<!-- tabs:start -->
## **Absolute Routes**

In absolute routes query parameters that were defined at root level are included in any path that contains the root node.

```ts
render(routes.users, {
  path: {},
  query: {
    state: "e2hlbGxvOiJ3b3JsZCJ9"
}); // ~> "/users?state=e2hlbGxvOiJ3b3JsZCJ9"
```

## **Relative Routes**

In relative routes, the `_` link can be used to render a subpath. However, this doesn't have any effect on the query parameters. Meaning a query parameter that was defined at the root level is never omitted when rendering a relative path.

```ts
render(routes._.users, {
  path: {},
  query: {
    state: "e2hlbGxvOiJ3b3JsZCJ9"
}); // ~> "users?state=e2hlbGxvOiJ3b3JsZCJ9"
```
<!-- tabs:end -->