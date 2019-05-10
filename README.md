# Typesafe Routes

In large frontend projects it can be quite difficult to detect broken links automatically. This package exposes a small helper that enables typesafe route creation to trace defective routes in compilation-time and to speed up development thanks to code-autocompletion.

## Installation

### NPM
```
npm i typesafe-routes
```

### Yarn
```
yarn add typesafe-routes
```

## Usage

``` ts
import {routeBuilder} from "typesafe-routes";

// define route tree
export interface IRoute {
  users: {                  // "/users"
    [userId: "string"]: {   // "/users/{userId}"
      remove: {}            // "/users/{userId}/remove"
      edit: {}              // "/users/{userId}/edit"
    }
  }
}

// baseUrl is optional
const baseUrl = "https://localhost:8081";

// create the root node
const route = routeBuilder<IRoute>(baseUrl);

// compose the route
route("users")("123")("remove")(); // "https://localhost:8081/users/123/remove"

// compile error since "add" is not defined
route("users")("123")("add")();
```

## React Router Example

Let's create an interface to define the route tree of our application.

``` ts
// routes.ts

export interface IRoute {
  home: {}                    // "/home"
  users: {                    // "/users"
    show: {                   // "/users/show"
      [userId: "string"]: {   // "/users/show/{userId}"
        remove: {}            // "/users/show/{userId}/remove"
      }
    }
    create: {}                // "/users/create"
  }
}

export const route = routeBuilder<IRoute>();

```

Now let's import the created `route` function and define our applications paths and parameters.

``` tsx
import {route} from "./routes.ts"

<Route path={route("home")()} />
<Route path={route("home")("users")()} />
<Route path={route("home")("users")("show")(":userId")()} />
...
```

We can now benefit from typesafe links that allow our application to scale without extensive path checking in unit tests.

``` tsx
// with full path
<Link to={route("home")("users")("show")(userId)("remove")()} />

// define root path to avoid duplicate code
const userRoute = route("home")("users")("show");
...
<Link to={userRoute(userId)("remove")()} />
```
