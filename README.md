# Typesafe Routes

In large frontend projects it can be quite difficult to detect broken links automatically. This package exposes a small helper that improves typesafety of your application routes in order to facilitate tracing down defective routes in compilation-time and to speed up development thanks to code-autocompletion.

## Installation

This library utilises [higher order type inference from generic functions](https://devblogs.microsoft.com/typescript/announcing-typescript-3-4/#higher-order-type-inference-from-generic-functions) hence requires at least TypeScript **3.4.1**.

### NPM
```
npm i typesafe-routes
```

### Yarn
```
yarn add typesafe-routes
```

## Basic Usage

``` ts
import { routeFactory } from "typesafe-routes";

export interface IRoutes {
  users: {              // "/users"
    [userId: string]: { // "/users/{userId}"
      remove: {}        // "/users/{userId}/remove"
      edit: {}          // "/users/{userId}/edit"
    }
  }
}

// baseUrl is optional
const baseUrl = "https://localhost:8081";

// create the root node
const r = routeFactory<IRoutes>(baseUrl);

// compose the route
r("users")("123")("remove").str(); // "https://localhost:8081/users/123/remove"

// compile error since "add" is not defined
r("users")("123")("add").str();
```

## Absolute Routes with React Router

This example suggests how you could create your applications absolute routes with the `routeFactory` helper.

You could have a separate file where you define your applications absolute paths and export a `routeFactory` helper `r` instance that is bound to you typed routes:

``` ts
// routes.ts
import { routeFactory } from "typesafe-routes";

export interface IRoute {
  home: {}                // "/home"
  users: {                // "/users"
    show: {               // "/users/show"
      [userId: string]: { // "/users/show/{userId}"
        remove: {}        // "/users/show/{userId}/remove"
      }
    }
    create: {}            // "/users/create"
  }
}

export const r = routeFactory<IRoute>();
```

Now let's import the created `r` function and define our applications paths and parameters.

``` tsx
import { r } from "./routes.ts"

export const Main = () => (
  <Switch>
    <Route path={r("home")("users")("show")(":userId").str()} component={...} />
    <Route path={r("home")("users").str()} component={...} />
    <Route path={r("home").str()} component={...} />
  <Switch>
);

```

Somewhere in a different component we could generate links by utilising the same helper `r`:

``` tsx
// with full path
<NavLink to={r("home")("users")("show")(userId)("remove").str()} />

// re-use a route in order to avoid duplicated code:
const showUsersRoute = r("home")("users")("show");
...
<NavLink to={showUsersRoute(userId)("remove").str()} />
```

Now we are benefiting from typescripts static type checking that allows our application to scale without the need for extensive testing.

## Relative Routes with React Router

Here an example for those who would like to utilise `routeFactory` to define relative routes in a react component that is going to be reused under one or multiple different higher-order routes.

``` tsx
import { routeFactory } from "typesafe-routes";

// ${baseUrl} is provided by the current react router context
interface IComponentRoutes {
  create: {}          // `${baseUrl}/create`
  read: {
    [id: string]: {}  // `${baseUrl}/read/:id`
  }
  update: {
    [id: string]: {}  // `${baseUrl}/update/:id`
  }
  delete: {
    [id: string]: {}  // `${baseUrl}/delete/:id`
  }
}

const MyComponent = withRouter(({
  match: { url, params: { id }},
}) => {
  const r = routeFactory<IComponentRoutes>(url);

  return (
    <ul>
      <li><NavLink to={r("create").str()}></li>
      <li><NavLink to={r("read")(id).str()}></li>
      <li><NavLink to={r("update")(id).str()}></li>
      <li><NavLink to={r("delete")(id).str()}></li>
    </ul>
  );
});
```
