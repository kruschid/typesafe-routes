# Custom Path Rendering

This section provides an example of a customized route renderer. The code fragment below is identical to the implementation of the `defaultRenderer.render` method. Some lines are highlighted with a comment. Each comment refers to a brief description below the code sample.

``` ts
import { defaultRenderer, Renderer } from "typesafe-routes";

export const customRenderer: Renderer = {
  // 1.
  ...defaultRenderer,

  // 2. 
  render: ({ pathSegments, isRelative, pathParams, queryParams }) => {
    const path: string[] = [];
    // path params
    pathSegments.forEach((pathSegment) => { // 3.
      if (typeof pathSegment === "string") {
        path.push(pathSegment);
      } else if (pathParams[pathSegment.name] != null) {
        path.push(encodeURI(pathParams[pathSegment.name]));
      }
    });

    // 4.
    const searchParams = new URLSearchParams(queryParams).toString();

    // 5.
    return (
      (isRelative ? "" : "/") +
      path.join("/") +
      (searchParams ? `?` : "") +
      searchParams
    );
  },
};
```

1. The `customRenderer` object implements the `Renderer` interface. Because the goal is only to change the path rendering, the renderer object inherits the remaining methods from the `defaultRenderer` object.
2. The `render` method accepts the current `RenderContext` as its first argument. From the context it requires the properties `pathSegments`, `isRelative`, `pathParams`, and `queryParams`.
   - `pathSegments` includes the static and dynamic segments of the resulting path 
   - `isRelative` property determines whether a leading `/` should be rendered
   - `pathParams` and `queryParams` are parameter objects with key-value pairs of type `Record<string, string>`
3. A `pathSegment` may be either be a static string segment or a dynamic segment (parameter). Static segments are added to the resulting `path` without no changes. Parameters are added only when they are defined. Every parameter is piped through `encodeURI` before being added to the result `path`.
4. `queryParams` are rendered using `URLSearchParams`. Alternatively, they could be rendered by using a library like [qs](https://github.com/ljharb/qs).
5. Depending on the value of `isRelative`, the return value could be an absolute path with a leading `/` or a relative path with no prefix. The path segments are joined with a `/` separator. If `searchParams` is truthy, it is concatenated with a prefix `?`.

<!-- tabs:start -->

## **Custom Renderer Registration**

The `customRenderer` object can be passed to `createRoutes` as the second argument.

``` ts
const routes = createRoutes({
  users: {
    path: ["users", int("uid"), bool.optional("edit")]
  }
}, customRenderer);
```

## **Custom Renderer Usage**

The `$render` method adapts the new renderer and creates paths using the described alogirthm.

``` ts
routes.users.$render({path: { uid: 123, edit: true }}); // => "/users/123/true"
```
<!-- tabs:end -->