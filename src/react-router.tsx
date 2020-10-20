import * as React from "react";
import { IParseOptions, parse } from "qs";
import { useLocation, useParams, Link as OriginalLink, NavLink as OriginalNavLink, Redirect as OriginalRedirect, RedirectProps } from "react-router-dom";
import { RouteNode } from ".";

export const useRouteParams = <T extends RouteNode<string, any, any>>(
  r: T,
  o: IParseOptions = {}
): ReturnType<T["parseParams"]> => {
  const { search } = useLocation();
  return r.parseParams({
    ...useParams(),
    ...parse(search, { ignoreQueryPrefix: true, ...o }),
  }) as any;
}

export const Link = (p: Omit<Parameters<typeof OriginalLink>[number], "to"> & {
  to: {$: string}
}) =>
  <OriginalLink {...p} to={p.to.$}>{p.children}</OriginalLink>;

export const NavLink = (p: Omit<Parameters<typeof OriginalNavLink>[number], "to"> & {
  to: {$: string}
}) =>
  <OriginalNavLink {...p} to={p.to.$}>{p.children}</OriginalNavLink>;

export const Redirect = (p: Omit<RedirectProps, "to"> & {
  to: {$: string}
}) =>
  <OriginalRedirect {...p} to={p.to.$} />;
