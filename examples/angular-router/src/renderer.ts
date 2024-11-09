import { Directive, Input, NgModule } from "@angular/core";
import { RouterLinkWithHref, RouterModule } from "@angular/router";
import { AnyRenderContext } from "typesafe-routes";

// renders paths and query record for angular router
export const renderPath = ({
  pathSegments,
  isRelative,
  pathParams,
  queryParams,
}: AnyRenderContext) => {
  const path = pathSegments.flatMap((pathSegment) =>
    // prettier-ignore
    typeof pathSegment === "string" ? (
        pathSegment
      ) :  pathParams[pathSegment.name] != null ? (
        pathParams[pathSegment.name]
      ) : []
  );

  return {
    path: (isRelative ? "" : "/") + path.join("/"),
    query: queryParams,
  };
};

// renders template for angular router
export const renderTemplate = ({ pathSegments }: AnyRenderContext) => {
  const template = pathSegments
    .map((pathSegment) =>
      typeof pathSegment === "string" ? pathSegment : `:${pathSegment.name}`
    )
    .join("/");

  return template; // path that doesn't start with a slash "/" character
};

/**
 * The RouterLinkWithHref is working as it should by setting the href correctly,
 * but Angular needs to register a click handler for it to prevent the default
 * behavior (which is the browser trying to navigate using a http request, as
 * we're experiencing).
 *
 * Normally, Angular implicitly knows to do this when it sees the routerLink
 * directive in your templates. When you set up the [routerLink] directive in
 * the template, Angular implicitly registers a click event handler to override
 * the default browser navigation.
 *
 * However, because we're setting up the router link via your custom directive,
 * the necessary event handlers aren't set up, as this is done by Angular when
 * it sees the routerLink in the template, not when we set it via your directive.
 */

@Directive({
  selector: "[typesafeRoutesLink]",
  providers: [RouterLinkWithHref],
})
export class TypesafeRoutesLinkDirective {
  constructor(private routerLink: RouterLinkWithHref) {}

  @Input() set typesafeRoutesLink(route: {
    path: string;
    query: Record<string, string>;
  }) {
    this.routerLink.routerLink = route.path;
    this.routerLink.queryParams = route.query;
  }
}

@NgModule({
  declarations: [
    // declare your directive here
    TypesafeRoutesLinkDirective,
  ],
  imports: [
    RouterModule, // importing as your directive relies on RouterLinkWithHref
  ],
  exports: [
    // export your directive here
    TypesafeRoutesLinkDirective,
  ],
})
export class TypesafeRoutesModule {}
