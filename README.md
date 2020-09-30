<img title="logo" src="logo.png" />

# Typesafe Routes

Spices up your favorite routing library by adding type safety to plain string-based route definitions. Let typescript handle the detection of broken links in compilation time while you create maintainable software products.

You can use this utility with your favorite framework that follows [path-to-regex](https://github.com/pillarjs/path-to-regexp) syntax (although we only support a subset of it). You can find some demo applications with [react-router](https://reacttraining.com/react-router/) or [express](https://expressjs.com/) in `src/demo`.

**Typesafe Routes utilizes [Template Literal Types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#template-literal-types) and [Recursive Conditional Types](https://devblogs.microsoft.com/typescript/announcing-typescript-4-1-beta/#recursive-conditional-types). These features are only available in [typescript version 4.1 which is still in beta. (release date is set to November 2020)](https://github.com/microsoft/TypeScript/issues/40124)**

## Installation (npm/yarn examples)

``` sh
npm i typesafe-routes@7.0.0-beta

# or

yarn add typesafe-routes@7.0.0-beta
```

## Usage

### `route(path: string, parserMap: Record<string, Parser>, children: Record<string, ChildRoute>)`

* `path: string` must be the path string according to the `path-to-regex` syntax.
* `parserMap: Record<string, Parser>` contains parameter specific parser (`Parser`) identified by parameter name (`string`)
* `children` assign children routes here in case you want to utilize serialization of nested routes

### Examples

``` ts
import { route, stringParser } from "typesafe-routes";

const settingsRoute = route("/settings", {}, {});

const accountRoute = route("/account/:accountId", {
  accountId: stringParser, // responsible for parsing/serialization
}, {
  settingsRoute, // child route
});

const userRoute = route("/user/:userId", {}, {});
// ts error: userId parser is missing

// serialisation:

accountRoute({ accountId: "5c9f1e79e96c" }).$
// returns "/account/5c9f1e79e96c"

accountRoute({ accountId: "5c9f1e79e96c" }).settingsRoute({}).$
// returns "/account/5c9f1e79e96c/settings"

accountRoute({ accountId: 123 }).$
// ts error: accountId can't be number 

accountRoute({ }).$
// ts error: missing accountId can't be number

// parsing:

accountRoute.parseParams({ accountId: "123"})
// returns { accountId: "123"}

```

Besides `stringParser` there are also `intParser`, `floatParser`, `dateParser`, and `booleanParser` shipped with the module. The implementation of custom parsers must follow the interface `Parser<T>`. You can find more details on that topic further down the page.

### Optional Parameters

Parameters can be suffixed with a question mark (`?`) to make the parameter optional.

``` ts
import { route, intParser } from "typesafe-routes";

const userRoute = route("/user/:userId/:groupId?", {
  userId: intParser,
  groupId: intParser, // parser must be specified for optional parameters
}, {});

// serialisation:

userRoute({ userId: 5 }).$
// returns "/user/5"

userRoute({ userId: 7, groupId: 34 }).$
// returns "/user/7/34"

userRoute({ userId: 7, grouId: 34 }).$
// ts error: typo in "grouId"

// parsing:

userRoute.parseParams({ userId: "6", groupId: "12" })
// returns { userId: 6, groupId: 12 }
```

### Query Parameters

Parameters can be prefixed with `&` to make the parameter a query parameter.

``` ts
import { route, intParser } from "typesafe-routes";

const usersRoute = route("/users&:start&limit", {
  start: intParser,
  limit: intParser,
}, {});

usersRoute({ start: 10, limit: 20 }).$
// returns "/users?start=10&limit=20"
```

When serialising nested routes query params are always being appended:

``` ts
import { route, intParser } from "typesafe-routes";

const settingsRoute = route("/settings&:expertMode", {
  expertMode: booleanParser,
}, {});

const usersRoute = route("/users&:start&limit", {
  start: intParser,
  limit: intParser,
}, {
  settingsRoute
});

usersRoute({ start: 10, limit: 20 }).settingsRoute({ expertMode: true })$
// returns "/users/settings?expertMode=true&start=10&limit=20"

userRoute.parseParams({ start: "10", limit: "20", expertMode: "false" });
// returns { start: 10, limit: 20, expertMode: false }
```

### Custom Parser 

If you need to parse/serialize other datatypes than primitive types or dates or the build-in parsers don't meet your requirements for some reason you can create your own parsers with a few lines of code. The `Parser<T>` interface that helps yo to achieve that is defined as followed:

``` ts
interface Parser<T> {
  parse: (s: string) => T;
  serialize: (x: T) => string;
}
```

The next example shows how it can be imported and used to implement a typesafe `Vector2D` parser/serializer.

``` ts
import { Parser, route } from "typesafe-routes";

interface Vector2D {
  x: number;
  y: number;
};

const vectorParser: Parser<Vector2D> = {
  serialize: (v) => btoa(JSON.stringify(v)),
  parse: (s) => JSON.parse(atob(s)),
};

const mapRoute = route("/map&:pos", { pos: vectorParser }, {});

mapRoute({ pos: { x: 1, y: 0 }}).$;
// returns "/map?pos=eyJ4IjoxLCJ5IjowfQ=="

vectorParser.parseParams({pos: "eyJ4IjoxLCJ5IjowfQ=="})
// returns { pos: { x: 1, y: 0 }}
```

## Roadmap

So far I consider this library feature-complete that's why I will be mainly concerned about fixing bugs and improving the API. However, if some high demand for additional functionality or PRs shows up I might be considering expanding the scope.

## Project Support

<a href="https://www.buymeacoffee.com/kruschid" target="_blank"><img width="30%" src="https://cdn.buymeacoffee.com/buttons/v2/default-orange.png" alt="Buy Me A Coffee" ></a>
