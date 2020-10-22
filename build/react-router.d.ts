/// <reference types="react" />
import { IParseOptions } from "qs";
import { Link as OriginalLink, NavLink as OriginalNavLink, RedirectProps } from "react-router-dom";
import { RouteNode } from ".";
export declare const useRouteParams: <T extends RouteNode<string, any, any, false>>(r: T, o?: IParseOptions) => ReturnType<T["parseParams"]>;
export declare const Link: (p: Omit<Parameters<typeof OriginalLink>[number], "to"> & {
    to: {
        $: string;
    };
}) => JSX.Element;
export declare const NavLink: (p: Omit<Parameters<typeof OriginalNavLink>[number], "to"> & {
    to: {
        $: string;
    };
}) => JSX.Element;
export declare const Redirect: (p: Omit<RedirectProps, "to"> & {
    to: {
        $: string;
    };
}) => JSX.Element;
