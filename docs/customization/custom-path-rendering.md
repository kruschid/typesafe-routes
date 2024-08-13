# Custom Path Rendering

This section provides an example of a customized route renderer. The code fragment below is identical to the implementation of the default `renderPath` function. Some lines are highlighted with a comment. Each comment refers to a brief description below the code sample.

``` ts
import { AnyRenderContext } from "typesafe-routes";

export const renderPath = (
  // 1.
  { pathSegments, isRelative, pathParams, queryParams }: AnyRenderContext
) => {
  const path: string[] = [];

  // 2.
  pathSegments.forEach((pathSegment) => { // 2.
    if (typeof pathSegment === "string") {
      path.push(pathSegment);
    } else if (pathParams[pathSegment.name] != null) {
      path.push(pathParams[pathSegment.name]);
    }
  });

  // 3.
  const searchParams = new URLSearchParams(queryParams).toString();

  // 4.
  const pathname = (isRelative ? "" : "/") + path.join("/");

  // 5.
  const search = (searchParams ? `?` : "") + searchParams;

  // 6.
  const href = pathname + search;

  // 7.
  return href;
};
```

1. The `renderPath` function accepts the a `AnyRenderContext` object as its first argument. From the context it requires the properties `pathSegments`, `isRelative`, `pathParams`, and `queryParams`.
   - `pathSegments` includes the static and dynamic segments of the resulting path 
   - `isRelative` property determines whether a leading `/` should be rendered
   - `pathParams` and `queryParams` are parameter objects with key-value pairs of type `Record<string, string>`
2. A `pathSegment` may be either a static string segment or a dynamic segment (parameter). Static segments are pushed to the resulting `path` array without no changes. Parameters are added only when they are defined in the `pathParams` object that was provided by the context.
3. `queryParams` are rendered using `URLSearchParams`. Alternatively, they could be rendered by using a library like [qs](https://github.com/ljharb/qs).
4. Depending on the value of `isRelative`, the return value could be an absolute path with a leading `/` or a relative path with no prefix. The path segments are joined with a `/` separator.
5. If `searchParams` is truthy, it is prefixed with a `?`.
6. `pathname` and `search` are concatenated and saved in `href`, the return value of the `renderPath` function.
7. In this example, `renderPath` returns a value of string type. However, it could also return any other types of values without compromising type safety. This could be a [URL object](https://developer.mozilla.org/en-US/docs/Web/API/URL) or an array of string segments. The type of the returned value will be reflected in the `$render` function.

<!-- tabs:start -->

## **Render Function Registration**

The `renderPath` function can be wrapped in an object along with the `defaultContext` object and provided as the second argument when calling the `createRoutes` function.

``` ts
import { defaultContext, createRoutes, int, bool } from "typesafe-routes";

const routes = createRoutes({
  users: {
    path: ["users", int("uid"), bool.optional("edit")]
  }
}, {
  ...defaultContext, // default context needs to be included
  renderPath, // this is the custom render function from above
});
```

## **Renderer Function Usage**

The `$render` method adapts the new `renderPath` function and creates paths using the demonstrated implementation.

``` ts
routes.users.$render({path: { uid: 123, edit: true }}); // => "/users/123/true"
```
<!-- tabs:end -->
