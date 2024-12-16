# Parameter Types

This section contains a list of parameter types that are included with the library. Refer to the [Custom Parameter Types](customization/custom-parameter-types.md) section to learn how to register parsers and serializers for other types.

<!-- tabs:start -->
## **str**
``` ts
import { createRoutes, str, renderPath, parsePath } from "typesafe-routes";

const routes = createRoutes({
  myRoute: {
    ["path", str("lang")]
  }
});

renderPath(routes.myRoute, { lang: "en" }); // ~> "/path/en"
parsePath(routes.myRoute, "/path/en"); // ~> { lang: "en" }
```

## **int**

``` ts
import { createRoutes, int, renderPath, parsePath } from "typesafe-routes";

const routes = createRoutes({
  myRoute: {
    ["path", int("id")]
  }
});

renderPath(routes.myRoute, { id: 55 }); // ~> "/path/55"
parsePath(routes.myRoute, "/path/55"); // ~> { id: 55 }
```

## **float**

``` ts
import { createRoutes, float, renderPath, parsePath } from "typesafe-routes";

const f2 = float(2); // renders 2 fraction digits

const routes = createRoutes({
  myRoute: {
    ["path", f2("x")]
  }
});

renderPath(routes.myRoute, { x: 55.1234 }); // ~> "/path/55.12"
parsePath(routes.myRoute, "/path/55.12"); // ~> { x: 55.12 }
```

## **isoDate**

``` ts
import { createRoutes, isoDate, renderPath, parsePath } from "typesafe-routes";

const routes = createRoutes({
  myRoute: {
    ["path", isoDate("date")]
  }
});

renderPath(routes.myRoute, { date: new Date(1706549242302) }); // ~> "/path/2024-01-29T17:27:22.302Z"
parsePath(routes.myRoute, "/path/2024-01-29T17:27:22.302Z"); // ~> { date: Date("2024-01-29T17:27:22.302Z") }
```

## **date**

``` ts
import { createRoutes, date, renderPath, parsePath } from "typesafe-routes";

const routes = createRoutes({
  myRoute: {
    ["path", date("date")]
  }
});

renderPath(routes.myRoute, { date: new Date(1706549242302) }); // ~> "/path/2024-01-29"
parsePath(routes.myRoute, "/path/2024-01-29"); // ~> { date: Date("2024-01-29") }
```

## **bool**

``` ts
import { createRoutes, bool, renderPath, parsePath } from "typesafe-routes";

const routes = createRoutes({
  myRoute: {
    ["path", bool("isVisible")]
  }
});

renderPath(routes.myRoute, { isVisible: true }); // ~> "/path/true"
parsePath(routes.myRoute, "/path/false"); // ~> { isVisible: false }
```

## **oneOf**

``` ts
import { createRoutes, oneOf, renderPath, parsePath } from "typesafe-routes";

const options = oneOf("movies", "music", "art")

const routes = createRoutes({
  myRoute: {
    ["path", options("category")]
  }
});

renderPath(routes.myRoute, { category: "music" }); // ~> "/path/music"
parsePath(routes.myRoute, "/path/art"); // ~> { category: "art" }
```

## **list**

``` ts
import { createRoutes, list, renderPath, parsePath } from "typesafe-routes";

const options = list(["movies", "music", "art"], ","); // second argument is optional, default is ";"

const routes = createRoutes({
  myRoute: {
    ["path", options("categories")]
  }
});

renderPath(routes.myRoute, { categories: ["music", "art"] }); // ~> "/path/music,art"
parsePath(routes.myRoute, "/path/art,movies,music"); // ~> { categories: ["art", "movies", "music"] }
```

<!-- tabs:end -->