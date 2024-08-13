# Custom Template Rendering

The default `renderTemplate` function prefixes absolute routes with a `/` sign. Dynamic segments (parameters) are prefixed with a `:` and optional parameters are tailed with a `?`:

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

The following implementation alters the default template rendering by putting curly braces around dynamic segments.

``` ts
import { AnyRenderContext } from "typesafe-routes";

export const renderTemplate = (
  // 1.
  { pathSegments, isRelative }: AnyRenderContext
) => {
  // 2.
  const template = pathSegments
    // 3.
    .map((pathSegment) =>
      typeof pathSegment === "string"
        ? pathSegment
        : `{${pathSegment.name}${pathSegment.kind === "optional" ? "?" : ""}}`
    )
    .join("/");
  
  // 4.
  const result = isRelative
    ? template
    : `/${template}`;

  // 5.
  return result;
};

```
1. The `renderTemplate` function takes only one argument: a `AnyRenderContext` object. The `AnyRenderContext` object contains several properties, such as `pathParams` or `queryParams`, but only `pathSegments` and `isRelative` are relevant for template rendering purposes.
2. A `pathSegment` can be a static segment of `string` type or a dynamic segment represented by a `Param` object. A `Param` object contains information about a parameter, such as its `name`, `parser`, or whether it's `required` or `optional`, 
3. A static segment remains unchanged when mapping path segments. A dynamic segment is wrapped with curly braces.
4. The `isRelative` flag in the provided `RenderContext` determines whether the resulting path starts with a `/` sign.
5. The resulting template is of type string. But a custom implementation of `renderTemplate` can return any other type as well. For example your router framework of choice could require an array of objects. The type returned by your custom implementation of `renderTemplate` will be reflected by the `$template` method.

<!-- tabs:start -->

## **Render Function Registration**

The `renderTemplate` function can be passed to `createRoutes` as the second argument.
The compiler will ask for additional context properties if you don't provide the `defaultContext` as well.

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

The `$template` method adapts the new render function and creates templates with dynamic segments enclosed in curly braces.

``` ts
routes.users.$template(); // => "/users/{uid}/{edit?}"
```
<!-- tabs:end -->
