# Custom Template Rendering

The default template renderer prefixes absolute routes with a `/` sign. Dynamic segments (parameters) are prefixed with a `:` and optional parameters are tailed with a `?`:

<!-- tabs:start -->

## **Absolute Path**

```
/segment/:param/:optional? 
```

## **Relative Path**

```
segment/:param/:optional? 
```
<!-- tabs:end -->

The following implementation alters the default template renderer by putting curly braces around dynamic segments.

``` ts
import { defaultRenderer, Renderer, int, bool } from "typesafe-routes";

const customRenderer: Renderer = {
  // 1.
  ...defaultRenderer,

  // 2.
  template: ({ pathSegment, isRelative }) => {
    // 3.
    const template = path.map((pathSegment) =>
      typeof pathSegment === "string"
        ? pathSegment
        : `{${pathSegment.name}${pathSegment.kind === "optional" ? "?" : ""}}`
    )
    .join("/");

    // 4.
    return isRelative
      ? template
      : `/${template}`;
  },
};
```

1. `customRenderer` implements the `Renderer` interface. Because the goal is to only modify the template rendering, the `customRenderer` object inherits other methods from the `defaultRenderer` object.
2. The template method takes only one argument: a `RenderContext` object. The `RenderContext` object contains many interesting properties, such as `pathParams` or `queryParams`, but only `pathSegments` and `isRelative` are relevant for template rendering purposes.
3. A `pathSegment` can be a static segment of `string` type or a dynamic segment represented by a `Param` object. A `Param` object contains information about a parameter, such as its `name`, `parser`, or whether it's `required` or `optional`, 
4. The `isRelative` flag in the provided `RenderContext` determines whether the resulting path starts with a `/` sign. 

<!-- tabs:start -->


## **Custom Renderer Registration**

The `customRenderer` object can be passed to `createRoutes` as the second argument.

``` ts
const routes = createRoutes({
  users: {
    path: ["users", int("uid"), bool("edit").optional]
  }
}, customRenderer);
```

## **Custom Renderer Usage**

The `template` method automatically used the new renderer and creates templates with dynamic segments enclosed in curly braces.

``` ts
routes.template("users"); // => "/users/{uid}/{edit?}"
```
<!-- tabs:end -->
