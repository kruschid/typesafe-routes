# Parameter Types

This section contains a list of parameter types that are included with the library. Refer to the [Custom Parameter Types](customization/custom-parameter-types.md) section to learn how to register parsers and serializers for other types.

<!-- tabs:start -->
## **str**
``` ts
import { createRoutes, str } from "typesafe-routes";

const routes = createRoutes({
  myRoute: {
    ["path", str("lang")]
  }
});

routes.myRoute.$render({path: {lang: "en"}}); // => "/path/en"
routes.myRoute.$parseParams("/path/en"); // => {lang: "en"}
```

## **int**

``` ts
import { createRoutes, int } from "typesafe-routes";

const routes = createRoutes({
  myRoute: {
    ["path", int("id")]
  }
});

routes.myRoute.$render({path: {id: 55}}); // => "/path/55"
routes.myRoute.$parseParams("/path/55"); // => {id: 55}
```

## **float**

``` ts
import { createRoutes, float } from "typesafe-routes";

const f2 = float(2); // renders 2 fraction digits

const routes = createRoutes({
  myRoute: {
    ["path", f2("x")]
  }
});

routes.myRoute.$render({path: {x: 55.1234}}); // => "/path/55.12"
routes.myRoute.$parseParams("/path/55.12"); // => {x: 55.12}
```

## **isoDate**

``` ts
import { createRoutes, isoDate } from "typesafe-routes";

const routes = createRoutes({
  myRoute: {
    ["path", isoDate("date")]
  }
});

routes.myRoute.$render({path: {date: new Date(1706549242302)}}); // => "/path/2024-01-29T17:27:22.302Z"
routes.myRoute.$parseParams("/path/2024-01-29T17:27:22.302Z"); // => {date: Date("2024-01-29T17:27:22.302Z")}
```

## **date**

``` ts
import { createRoutes, date } from "typesafe-routes";

const routes = createRoutes({
  myRoute: {
    ["path", date("date")]
  }
});

routes.myRoute.$render({path: {date: new Date(1706549242302)}}); // => "/path/2024-01-29"
routes.myRoute.$parseParams("/path/2024-01-29"); // => {date: Date("2024-01-29")}
```

## **bool**

``` ts
import { createRoutes, bool } from "typesafe-routes";

const routes = createRoutes({
  myRoute: {
    ["path", bool("isVisible")]
  }
});

routes.myRoute.$render({path: {isVisible: true}}); // => "/path/true"
routes.myRoute.$parseParams("/path/false"); // => {isVisible: false}
```

## **oneOf**

``` ts
import { createRoutes, oneOf } from "typesafe-routes";

const options = oneOf("movies", "music", "art")

const routes = createRoutes({
  myRoute: {
    ["path", options("category")]
  }
});

routes.myRoute.$render({path: {category: "music"}}); // => "/path/music"
routes.myRoute.$parseParams("/path/art"); // => {category: "art"}
```

## **list**

``` ts
import { createRoutes, list } from "typesafe-routes";

const options = list(["movies", "music", "art"], ","); // second argument is optional, default is ";"

const routes = createRoutes({
  myRoute: {
    ["path", options("categories")]
  }
});

routes.myRoute.$render({path: {categories: ["music", "art"]}}); // => "/path/music,art"
routes.myRoute.$parseParams("/path/art,movies,music"); // => {categories: ["art", "movies", "music"]}
```

<!-- tabs:end -->