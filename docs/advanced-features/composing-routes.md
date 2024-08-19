# Composing Routes

Routes that belong to a feature or component can be shared across projects. The entire route tree, passed to `createRoute` as the first argument, can be accessed via the `$routes` property, including the corresponding types. This eliminates the need to define and export the route tree in a separate step.

``` ts

// user.routes.ts
const usersRoutes = createRoutes({
  detail: {
    path: ["detail", int("uid")],
  },
});

// global.routes.ts
const globalRoutes = createRoutes({
  home: {
    path: ["home"],
  },
});

// app.routes.ts
const routes = createRoutes({
  ...globalRoutes.$routes,
  user: {
    path: ["user"],
    children: usersRoutes.$routes,
  },
});

routes.home.$render({}); // => "/home"
routes.user.detail.$render({ path: { uid: 123 } }) // => "/user/detail/123"
```

This example specifies `usersRoute.$routes` as a descendant of `routes.user`. The `globalRoutes.$routes` object, on the other hand, is merged into the routes at the root level.
