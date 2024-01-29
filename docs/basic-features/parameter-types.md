# Parameter Types

<!-- tabs:start -->
## **str**
``` js
import { createRoutes, str } from "typesafe-routes";

const routes = createRoutes({
  home: ["home", str("lang")]
});

routes.render("home", {path: {lang: "en"}}); // => "/home/en"
routes.parseParams("home",  "/home/en"); // => {lang: "en"}
```

## **int**

``` js
import { createRoutes, int } from "typesafe-routes";

const routes = createRoutes({
  home: ["home", int("id")]
});

routes.render("home", {path: {id: 55}}); // => "/home/55"
routes.parseParams("home", "/home/55"); // => {id: 55}
```

## **float**

``` js
import { createRoutes, float } from "typesafe-routes";

const f2 = float(2); // renders 2 fraction digits

const routes = createRoutes({
  home: ["home", f2("x")]
});

routes.render("home", {path: {x: 55.1234}}); // => "/home/55.12"
routes.parseParams("home", "/home/55.12"); // => {x: 55.12}
```

## **isoDate**

``` js
import { createRoutes, isoDate } from "typesafe-routes";

const routes = createRoutes({
  home: ["home", isoDate("date")]
});

routes.render("home", {path: {date: new Date(1706549242302)}}); // => "/home/2024-01-29T17:27:22.302Z"
routes.parseParams("home", "/home/2024-01-29T17:27:22.302Z"); // => {date: Date(...)}
```

## **date**

``` js
import { createRoutes, date } from "typesafe-routes";

const routes = createRoutes({
  home: ["home", date("date")]
});

routes.render("home", {path: {date: new Date(1706549242302)}}); // => "/home/2024-01-29"
routes.parseParams("home", "/home/2024-01-29"); // => {date: Date(...)}
```

## **bool**

``` js
import { createRoutes, bool } from "typesafe-routes";

const routes = createRoutes({
  home: ["home", bool("isVisible")]
});

routes.render("home", {path: {isVisible: true}}); // => "/home/true"
routes.parseParams("home", "/home/false"); // => {isVisible: false}
```

## **oneOf**

``` js
import { createRoutes, oneOf } from "typesafe-routes";

const options = oneOf("movies", "music", "art")

const routes = createRoutes({
  home: ["home", options("category")]
});

routes.render("home", {path: {category: "music"}}); // => "/home/music"
routes.parseParams("home", "/home/art"); // => {category: "art"}
```

## **list**

``` js
import { createRoutes, list } from "typesafe-routes";

const options = list(["movies", "music", "art"], ","); // second argument is optional, default is ";"

const routes = createRoutes({
  home: ["home", options("categories")]
});

routes.render("home", {path: {categories: ["music", "art"]}}); // => "/home/music,art"
routes.parseParams("home", "/home/art,movies,music"); // => {categories: ["art", "movies", "music"]}
```

<!-- tabs:end -->