import { query } from "express";
import { Param } from "./param";
import { int } from "./parser";

type ParserMap<Params extends Param[]> = {
  [K in Params[number]["name"]]: Extract<Params[number], { name: K }>["parser"];
};

type ParamsRecord<Params extends Param<any, any, any>[]> = {
  [K in Extract<Params[number], { kind: "required" }>["name"]]: ReturnType<
    Extract<Params[number], { name: K }>["parser"]["parse"]
  >;
} & {
  [K in Extract<Params[number], { kind: "optional" }>["name"]]?: ReturnType<
    Extract<Params[number], { name: K }>["parser"]["parse"]
  >;
};

type RouteTag = <
  Params extends Param<any, any, any>[] // inference breaks if this is not extended from an array
>(
  strings: TemplateStringsArray,
  ...params: Params
) => RouteContext<
  Params,
  Params[0]["name"] extends string ? [params: ParamsRecord<Params>] : []
>;

type RouteContext<
  Params extends Param<any, any, any>[],
  RenderOptions extends any[],
  AssignedChildren extends Record<string, RouteContext<any, any>> = {}
> = {
  query: <Query extends Param<any, any, any>[]>(
    ...query: Query
  ) => RouteContext<Params, [...RenderOptions, query: ParamsRecord<Query>]>;
  hash: <State extends Param<any, any, any>[]>(
    ...hash: State
  ) => RouteContext<Params, [...RenderOptions, hash: ParamsRecord<State>]>;
  state: <State extends Param<any, any, any>[]>(
    ...state: State
  ) => RouteContext<Params, [...RenderOptions, state: ParamsRecord<State>]>;
  children: <Children extends Record<string, any>>(
    children: Children
  ) => RouteContext<Params, RenderOptions, Children>;
  // children: <Child extends RouteContext<any, any>>(children: Child) => any; //RouteContext<Params, RenderOptions, { test: Child }>;
  child: AssignedChildren;
  //   parserMap: ParserMap<Params>;
  //   params: ParamsRecord<Params>;
  //   query: ParamsRecord<Query>;
  //   hash: ParamsRecord<Params>;
  //   state: ParamsRecord<Params>;
  //   template: Template<P>;
  //   params: Params;
  //   render
  //   renderPath
  //   renderQuery
} & ((...options: RenderOptions) => any);

const route: RouteTag = (strings, ...params) => {
  return null as any;
};

const a = route`user/details/${int("a")}/${int("b")}/*`
  .query(int("a"), int("b").optional)
  .state(int("s1"))
  .hash(int("h"));
a({ a: 1, b: 2 }, { a: 1 }, { s1: 1 }, { h: 1 });

const b = route`user/details/${int("p")}/*`
  .query(int("a"), int("b").optional)
  .state(int("s1"))
  .hash(int("h"));
b({ p: 1 }, { a: 1 }, { s1: 1 }, { h: 1 });

const c = route``.children({
  a: route`/${int("a")}`,
  b: route`/${int("b")}`
    .query(int("q1"), int("q2"))
    .state(int("s1"))
    .children({
      c: route`/abc/${int("a")}${int("b").optional}`
        .query(int("c"), int("d"))
        .state(int("e"), int("f")),
    }),
});

c.child.b.child.c({ a: 1, b: 2 }, { c: 3, d: 4 }, { e: 5, f: 6 });

const r = route`user/details/${int("a")}/${int("b")}/*`.query(
  int("a"),
  int("b").optional
);
const t = r({ a: 1, b: 3 }, { a: 1, b: 1 });
