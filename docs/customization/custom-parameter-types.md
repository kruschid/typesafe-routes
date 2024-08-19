# Custom Parameter Types

The `param` helper facilitates the easy creation of custom parameters when default ones such as `str`, `int`, or `bool` do not fully meet your application's requirements. It requires two methods: one for serialization and another for parsing. In JavaScript, you can disregard type annotations. However, in TypeScript, they are necessary as the parameter types are inferred from them.

``` ts
const myParam = param({
  serialize: (value: MyType) => stringify(value),
  parse: (value: MyType) => parse(value),
});
```

Here are more examples:

<!-- tabs:start -->
## **TypeScript**

``` ts
import { createRoutes, param } from "typesafe-routes";

interface Pos {
  lat: number
  lon: number
}

const pt = param({
  serialize: (value: Point) => JSON.stringify(value),
  parse: (value: string) => JSON.parse(value),
});

const routes = createRoutes({
  map: {
    path: ["map"],
    query: [pt("coordinates")]
  }
});

routes.map.$render({ query: {
  coordinates: {
    lat: 51.386998452,
    lon: 30.092666296,
  }
}}) // => "/map?coordinates=%7B%22lat%22:51.386998452,%22lon%22:30.092666296%7D"
```

## **JavaScript**

``` js
import { createRoutes, param } from "typesafe-routes";

const pt = param({
  serialize: (value) => JSON.stringify(value),
  parse: (value) => JSON.parse(value),
});

const routes = createRoutes({
  map: {
    path: ["map"],
    query: [pt("coordinates")]
  }
});

routes.map.$render({ query: {
  coordinates: {
    lat: 51.386998452,
    lon: 30.092666296,
  }
}}) // => "/map?coordinates=%7B%22lat%22:51.386998452,%22lon%22:30.092666296%7D"
```

## **Paramaterized Params**

``` ts
import { createRoutes, param } from "typesafe-routes";

const float = (fractionDigits?: number) =>
  param({
    parse: (value: string) => parseFloat(value),
    serialize: (value: number) => value.toFixed(fractionDigits),
  });

const f2 = float(2);

const routes = createRoutes({
  video: {
    path: ["video"],
    query: [f2("time")],
  }
});

routes.video.$render({
  query: { time: 13.3745 },
}) // => "/video?time=13.37"
```
<!-- tabs:end -->
