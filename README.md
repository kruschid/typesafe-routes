# Typesafe Routes

This small library exposes functions and typings that allow you to define constraints for your application routes which enable automatic detection of broken links in compile time due to typescripts' static typing ability. In most cases this not only increases efficiency when using IDE with autocompletion but also is also a way to facilitate refactoring of larger code base.

## Installation (npm/yarn examples)

``` sh
npm i typesafe-routes

# or

yarn add typesafe-routes
```

## Tutorial

### Basic Usage 

In order to get started we need to define the constraints for our routes first:

``` ts
export const routes = {
  dashboard: {  // /dashboard
    apps: {     // /dashboard/apps
      all: {}   // /dashboard/apps/all
    }
  }
}
```

In order to define the constraints we created the object `routes` that has a nested structure. Our root node is `dashboard` and its'only child is `apps` which is also the parent of the node `all`.

In order to generate the corresponding paths we utilise the function `R` that we import from this library.

``` ts
import { R } from "typesafe-routes";

const r = R(routes);

r.dashboard.toString();           // => /dashboard
r.dashboard.apps.toString();      // => /dashboard/apps
r.dashboard.apps.all.toString();  // => /dashboard/apps/all
r.dashboard.apps.new.toString();  // type error because "apps" doesn't have child node "new"
```

Alternatively you can use the short notation by invoking the `.toString()` method implicitly by utilising string interpolation:

``` ts
`${r.dashboard}`          // => /dashboard
`${r.dashboard.apps}`     // => /dashboard/apps
`${r.dashboard.apps.all}` // => /dashboard/apps/all
```

This pretty much sums up the basic concept of this library. By leveraging static types we can ensure that our path corresponds to the nested structure of our `routes` object.

But when developing advanced products there are of course more scenarios that need to be covered when dealing with routes. The following sections provide a short summary how this library can support you with such cases.

### Defining `baseUrl`

Defining a `baseUrl` can be achieved by defining the second parameter of the `R` function. The `baseUrl` is a string that could be anything (`R` doesn't perform validation on that string) a url, a fragment indicator (e.g. `#` that is useful when using `HashRouter`) or simpliy the current url of a component (e.g. `withRouter` React-Router).

``` ts
// url
let r = R(routes, "https://localhost:8080");
`${r.dashboard}` // => https://localhost:8080/dashboard

// fragment indicator
r = R(routes, "#");
`${r.dashboard}` // => #/dashboard

// url of react component
r = R(routes, props.match.url);
`${r.dashboard}` // => /my/component/path/dashboard
```

### Main Page

In this section we want to generate a path to the main page of our website e.g. "`/`", "`#/`" or "`https://localhost:8080/`". In order to do that we need to define an empty property using an empty string for the name:

``` ts
const routes = {
  "": {}
  dashboard: { ... }
}
```

Now we can generate a path by passing an empty string for the node name:

``` ts
let r = R(routes);
`${r[""]}` // => /

// or with a baseUrl:
r = R(routes, "#");
`${r[""]}` // => #/
```

It's not recommended to define any children under the main-page node since this will generate an invalid path.

``` ts
const routes = {
  "": {
    dashboard: { ... }  // bad
  },
  dashboard: { ... }    // good
}

`${r[""].dashboard}` // => //dashboard (invalid)
`${r.dashboard}`     // => /dashboard
```

### Parameters

#### Basic Example

This library has support for typed parameters. You can find a basic example in the code below where a node named `show` takes on named parameter `userId`:

``` ts
const routes = {
  users: {
    find: (name: string, start: number, limit: number) => ({
      show: (userId: string) => ({})
    }),
  }
}

const r = R(routes);
`${r.users.find("ruth", 50,   30)}`
// => /users/find/ruth/50/30
`${r.users.find("ruth", 50,   30).show("434ef34")}`
// => /users/find/ruth/50/30/show/434ef34
`${r.users.find("ruth", "50", 30)}`
// => type error since 'start' is not a number
```

The code fragment defines a hierarchical structure with three nodes `users`, `find` and `show`. The two  nodes `find` and `show` are taking parameters. This is an basic example that is perfectly sufficient so far.However reviewing a code fragment like `find("ruth", 50, 30)` is not very efficient since there is no way for the reviewer to see directly whether `50` is the value for `start` or `limit` without looking up the definition in a different file. The next section tries to approach this issue with a concept that is very similar to named arguments which are known from lagnuages like C# or Python.

#### Named Parameters

Named arguments are not available in typescript but we can achieve something similar by utilising objects. In the following example we modify the signature of `find` in order to assign names to each parameter: 

``` ts
const routes = {
  users: {
    find: (
      _: {name: string},
      __: {start: number},
      ___: {limit: number},
    ) => ({}),
  }
}
```

In order to avoid issues with the compiler we assign some weird names (`_`, `__` and `___`) to our parameters. But we could avoid this by using the spread operator in combination with a typed array:

``` ts
const routes = {
  users: {
    find: (..._: [
      {name: string}, {start: number}, {limit: number},
    ]) => ({}),
  }
}
```

Now since we have preserved the parameter order and their names we can generate the corresponding paths by writing:

``` ts
const name = "ruth";
const start = 50;
const limit = 100;

const r = R(routes);
`${r.users.find({name}, {start}, {limit})}`
// => /users/find/ruth/50/30
`${r.users.find({name}, {limit}, {start})}`
// type error since second parameter doesn't match the expected type
```

#### Overloading

With the spread operator in combination with union type we can also achieve overloading which can be pretty convenient in different use cases:

``` ts
const routes = {
  users: {
    find: (..._:
      | [{name: string}, {start: number}, {limit: number}],
      | [":name", ":start", ":limit"],
    ) => ({}),
  }
}
```

With this example we now are able to create route templates without making compromises regarding type-safety:

``` tsx
const r = R(routes);

// template for react router:
<Route
  route={`${r.users.find(":name", ":start", ":limit")}`}
  component={...}
/>

// getting a specific path
<NavLink
  to={`${r.users.find({name, start, limit})}`}
>
  Find users with name "ruth"!
</NavLink>
```

#### Type Inference

It is very useful to infer the type of parameters that are defined in a route node. This library exposes a a generic type `WithParams<T>` that is able to extract type information from a given node.

``` ts
import { WithParams } from "../src";

type Routes = typeof routes;
type Params = WithParams<Routes>;

const routes = {
  users: {
    find: (..._:
      | [{name: string}, {start: number}, {limit: number}],
      | [":name", ":start", ":limit"],
    ) => ({
      show(..._:
        | [{userId: string}]
        | [":userId"]
      ) => ({})
    }),
  }
}
```

In the example above we import the type `WithParams` and apply it on the actual type of our `routes` object. The following code fragment demonstrates how we can get the types of the node `find` and those the child `show`:

``` ts
// find:
Params["users"]["find"]["params"]
// {name: string} & {start: number} & {limit: number}

// show:
Params["users"]["find"]["children"]["show"]["params"]
// {userId: string}
```

The `WithParams` type combines all object parameters of a node via intersection type. Additionally it filters out primitive types since intersection of object with a primitve type would give us the type `never`. Example:

``` ts
type T = {userId: string } & ":userId" // never
```

#### Custom Parameter Type

For many use cases primitive types are not sufficient so you as a developer might want to involve your own data type without bypassing type checking. The code fragment below adds an additional parameter `registrationDate` of the type `ISODate` to our example from above:

``` ts
const route = {
  users: {
    find: (..._ : [
      {name: string},
      {start: number},
      {limit: number},
      {registrationDate: ISODate},
    ]) => ({})
  }
}

const registrationDate = new ISODate(2017, 1, 1)

`${r.users.find({name}, {start}, {limit}, {registrationDate})}`
// => /users/find/ruth/50/100/2017-01-01
```

With `ISODate` implemented as followed:

``` ts
class ISODate {
  constructor(
    private year: number,
    private month: number,
    private date: number,
  ){}

  toString() {
    return [
      String(this.year).padStart(4, "0"),
      String(this.month).padStart(2, "0"),
      String(this.date).padStart(2, "0"),
    ].join("-");
  }
}
```

#### Query String Parameters

In order to add a query component to your path (e.g. `?param=value`) you may want either use `QueryParams` class that is provided by this library or implement your own renderer. 

``` ts
import { QueryParams } from "typesafe-routes";

const routes = {
  users: {
    search(..._: [
      {query: QueryParams<{name: string, limit: number}>}
    ]) => ({})
  }
}

const query = new QueryParams({name: "ruth", limit: 100});
`${r.users.search({query})}`
// => /users/search?name=ruth&limit=100
```

The `QueryParams` is a wrapper that internally utilises a querystring stringifyer ([qs](https://github.com/ljharb/qs)). `qs.stringify` gives you different formatting options e.g. `arrayFormat` ("`a=b,c`" vs "`a[]=b&a[]=c`" vs "`a[0]=b&a[1]=c`" etc.). You can either pass an options object as the second parameter of `QueryParams` or implement your own `QueryParams` wrapper in case `qs.stringify` doesn't meet your requirements for some reasons. In order to implement your custom query formatter you must import the `QUERY_FORMATTER` symbol and set it as name of a static property with the value `true`: 

``` ts
import { QUERY_FORMATTER } from "typesafe-routes";
import { stringify } from "qs";

class MyQueryParams<T> {
  public constructor (private params: T) {}

  public static [QUERY_FORMATTER] = true;
  public toString() {
    stringify({p: this.params}, {allowDots: true});
  }
}

const query = new MyQueryParams({name: "ruth", limit: 100});

`${r.users.search({query})}`
// => /users/search?p.name=ruth&p.limit=100
```

### React Router Case Study

This example suggests how you could create your applications routes with the `Ruth` helper.

``` tsx
// my-component.ts
import { R, WithParams } from "typesafe-routes";

type Routes = typeof routes;
type Params = WithParams<Routes>;
type MyComponentParams = Params["users"]["show"]["params"];

const routes = {
  users: {        // "/users"
    show: (_...:  // "/users/show/{userId}"
      | [{userId: string}]
      | [":userId"]
    ) => ({
      remove: {}  // "/users/show/{userId}/remove"
    })
  }
}

export const MyComponent = withRouter<MyComponentParams>((
  {match: {params: {userId}}},
) => {
  const r = R(routes);

  return (
    <>
      <NavLink to={`${r.users.show({userId}).remove}`}>
        Remove User #{userId}
      </NavItem>
      <Switch>
        <Route path={`${r.users.show(":userId").remove}`} component={...} />
      <Switch>
    </>
  );
});
```
