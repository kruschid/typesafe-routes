import { IParseOptions } from "qs";
import { Link as ReactRouterLink, type NavigateProps, NavLink as ReactRouterNavLink } from "react-router-dom";
import { RouteNode } from ".";
export declare const useRouteParams: <T extends RouteNode<string, any, any, false>>(r: T, o?: IParseOptions) => ReturnType<T["parseParams"]>;
export declare const Link: (p: Omit<Parameters<typeof ReactRouterLink>[number], "to"> & {
    to: {
        $: string;
    };
}) => JSX.Element;
export declare const NavLink: (p: Omit<Parameters<typeof ReactRouterNavLink>[number], "to"> & {
    to: {
        $: string;
    };
}) => JSX.Element;
export declare const Redirect: (p: Omit<NavigateProps, "to"> & {
    to: {
        $: string;
    };
}) => JSX.Element;
