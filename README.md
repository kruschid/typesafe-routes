# Typesafe Routes

In big frontend projects it can be quite difficult to detect broken links automatically. This package exposes a small helper that enables typesafe route creation to trace defective routes in compilation-time and to speed up development thanks to code-autocompletion.

## Installation

### NPM
```
npm i typesafe-route
```

### Yarn
```
yarn add typesafe-route
```

## Usage

``` ts
// import routeBuilder
import {routeBuilder} from "typesafe-routes";

// define route tree
export interface IRoute {
  users: {
    // defining params via index signature
    [userId: "string"]: {
      remove: {}
      // empty object means no children
      edit: {}
    }
  }
}

// define baseUrl (optional)
const baseUrl = "https://localhost:8081";

// create the root node
const route = routeBuilder<IRoute>(baseUrl);

// compose the route
const users = route("users")
const removeUser123 = users("123")("remove");

// generate string
removeUser123(); // https://localhost:8081/users/123/remove
```

## React Router Example

Let's create an interface to define the route tree of out application.

``` ts
// routes.ts

export interface IRoute {
  home: {}
  users: {
    show: {
      [userId: "string"]: {
        remove: {}
      }
    }
    create: {}
  }
}

export const route = routeBuilder<IRoute>();

```

Now let's import the created `route` function and define our application paths and parameters.

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

// or with relative path
const userRoute = route("home")("users")("show");
...
<Link to={userRoute(userId)("remove")()} />
```
