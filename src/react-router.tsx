import { IParseOptions, parse } from "qs";
import React from "react";
import {
  Link as ReactRouterLink,
  Navigate as ReactRouterNavigate,
  type NavigateProps,
  NavLink as ReactRouterNavLink,
  useLocation,
  useParams
} from "react-router-dom";
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

export const Link = (p: Omit<Parameters<typeof ReactRouterLink>[number], "to"> & {
  to: { $: string }
}) =>
  <ReactRouterLink {...p} to={p.to.$}>{p.children}</ReactRouterLink>;

export const NavLink = (p: Omit<Parameters<typeof ReactRouterNavLink>[number], "to"> & {
  to: { $: string }
}) =>
  <ReactRouterNavLink {...p} to={p.to.$}>{p.children}</ReactRouterNavLink>;

export const Redirect = (p: Omit<NavigateProps, "to"> & {
  to: { $: string }
}) =>
  <ReactRouterNavigate {...p} to={p.to.$} />;
