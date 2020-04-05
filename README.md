# Typesafe Routes

This small library exposes functions and typings that allow you to define constraints for your application routes which enable automatic detection of broken links in compile time.

This project is framework agnostic. This means you can use it with your favorite framework (e.g. [react-router](https://reacttraining.com/react-router/), [express](https://expressjs.com/), etc.) that utilises plain string routes.

## Installation (npm/yarn examples)

``` sh
npm i typesafe-routes

# or

yarn add typesafe-routes
```

## Features

### Basic Usage 

``` ts
import { R } from "typesafe-routes";

interface UsersRoute {
  name: "users"
  params: []
  children:
    | DetailsRoute 
    | GroupRoute
}

interface DetailsRoute {
  name: "details"
  params: [{id: number}]
}

interface GroupRoute {
  name: "group"
  params: [{groupId: number}, {page: number}]
}

const r = R<UsersRoute>("http://localhost:8080");

r.users().$
// http://localhost:8080/users

r.users().details({id: 1}).$
// http://localhost:8080/users/details/1

r.users().group({groupId: 5}, {page: 1}).$
// http://localhost:8080/users/group/5/1

r.users("12").$
// compilation error: UsersRoute doesn't define params

r.users().details().$
// compilation error: GroupRoute defines params
```

### Route Parameters
A route consists of a name, an array of `0` to `n` parameters and its' children (optional). Later the parameter values are rendered after the route name in the specified order (e.g. `<name>/<param1-value>/<param2-value>/...`). In order to specify the order we define the parameters as a list:

```ts
interface MyRoute {
  name: "<name>"
  params: [{param1: string}, {param2: string}, ...]
}
```

We define named parameters (object literal with one key-value pair) in order to (a) obtain IDE autocompletion when putting parameter values in corresponding function calls and (b) enable parameter extraction from our route definitions:

```ts
import { RouteParams } from "typesafe-routes";

type Params = RouteParams<MyRoute>;
// return intersection type from params array definition
// {param1: string} & {param2: string} & ... 
```

### Parameter Overloading

In several cases parameter overloading is a common requirement (e.g. optional parameters or typesafe route templating).

```ts
interface UserRoute {
  name: "user"
  params:
    | []
    | [{userId: number}]
    | [":userId?"]
}

const r = R<UsersRoute>();

r.user().$ // /user
r.user({userId: 1}).$ // /user/1
r.user(":userId?").$ // /user/:userId?
r.user(":id").$ // compile error
```

### Query Parameters

`QueryParams` is a special parameter type. `QueryParams` values are always rendered at the end of the route. Even though they were defined at a higher level in the hierarchy.

``` ts
import { QueryParams, queryParams } from "typesafe-routes";

interface UsersRoute {
  name: "users"
  params: [{groupId: number}, QueryParams<{page: number}>]
  children: UserSearchRoute
}

interface UserSearchRoute {
  name: "search"
  params: [QueryParams<{name: string, limit: number}>]
}

r.users({groupId: 1}, queryParams({page: 3}))
  .search(queryParams({name: "Ruth", limit: 10})).$
// /users/1/search?name=Ruth&limit=10&page=3
```

Under the hood query string are rendered by [qs](https://www.npmjs.com/package/qs). But you can also pass a custom renderer as the third parameter of `R`:

``` ts
const stringify = (params: Record<string, any>) =>
  `?state=${Buffer.from(JSON.stringify(params)).toString("base64")}`;

const r = R<MyRoute>("", {}, stringify);

r.users({groupId: 1}, querParams({page: 3}))
  .search(queryParams({name: "Ruth", limit: 10})).$
// /users/1/search?state=eyJwYWdlIjoxLCJuYW1lIjoiUnV0aCIsImxpbWl0IjoxMH0=
```

### Non Primitive Parameter Types

`ISODate` implements `toString` in order to print a date in ISO format.

``` ts
interface BlogRoute {
  name: "blog"
  params:
    | []
    | [{date: ISODate}]
}

r.blog({date: new ISODate(2019, 3, 5)}).$ // /blog/2019-03-05
```

### React Router Example

``` tsx
// MyComponent.ts
import { R, RouteParams } from "typesafe-routes";

interface UsersRoute {
  name: "users"
  params: []
  children: {
    name: "show"
    params:
      | [{userId: string}]
      | [":userId"]
    children: {
      name: "remove"
      params: []
    }
  }
}

export const MyComponent = withRouter<RouteParams<ShowUserRoute>>((
  {match: {params: {userId}}},
) => {
  const r = R<UsersRoute>();

  return (
    <>
      <NavLink to={r.users().show({userId}).remove().$}>
        Remove User #{userId}
      </NavItem>
      <Switch>
        <Route path={r.users().show(":userId").remove().$} component={...} />
      <Switch>
    </>
  );
});
```

The example above demonstrates that routes can also be defined as nested types. While this is a legit example the given notation might complicate debugging.

## Roadmap

PRs are very welcome :-)

- [ ] add express example
- [ ] add angular example
- [ ] add vue example
- [ ] add koa example
