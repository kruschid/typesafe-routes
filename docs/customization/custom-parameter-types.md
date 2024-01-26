# Custom Parameter Types

<!-- tabs:start -->
## **TypeScript**

```js
import { createRoutes, param } from "typesafe-routes";

interface Pos {
  lat: number
  lon: number
}

// simplified version without validation
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

routes.render("map", { query: {
  coordinates: {
    lat: 51.386998452,
    lon: 30.092666296,
  }
}}) // => "/map?coordinates=%7B%22lat%22:51.386998452,%22lon%22:30.092666296%7D"
```

## **JavaScript**
```js
import { createRoutes, param } from "typesafe-routes";

// simplified version without validation
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

routes.render("map", { query: {
  coordinates: {
    lat: 51.386998452,
    lon: 30.092666296,
  }
}}) // => "/map?coordinates=%7B%22lat%22:51.386998452,%22lon%22:30.092666296%7D"
```

## **Paramaterized Params**

```js
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

routes.render("video", {
  query: { time: 13.3745 },
}) // => "/video?time=13.37"
```
<!-- tabs:end -->
