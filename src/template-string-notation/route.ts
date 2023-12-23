import { Param } from "./param";
import { int, str } from "./parser";

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

// type TemplateOptions<
//   Children extends { [k: K]: RouteContext<any, any> },
//   K extends string = string
// > = K extends never ? "" : `${K}.${TemplateOptions<Children[any]["child"]>}`;
// type Template<Children extends Record<string, RouteContext<any, any>>> = (
//   options: TemplateOptions<Children>
// ) => string;

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
  // template: Template<P>;
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

// param infered from string template:
const route2: any = null;
route2(
  "/users/:uid/groups/:gid?&search&filter&limit#hash$state",
  {
    ":uid": int,
    ":guid": int,
    "&search": str,
    "&filter": str,
    "&limit": int,
    "#hash": str,
    $state: str,
  },
  {
    child: route2("settings/:section", {
      ":section": str,
    }),
  }
);

// moved third parameter to optional method
route2("/users/:uid/groups/:gid?&search&filter&limit#hash$state", {
  ":uid": int,
  ":guid": int,
  "&search": str,
  "&filter": str,
  "&limit": int,
  "#hash": str,
  $state: str,
}).children({
  child: route2("settings/:section", {
    ":section": str,
  }),
});

const routes = null as any;

const root2 = route2`/`.children({
  users: route2`users/${int("uid")}/groups/${int("gid").optional}`
    .query(str("search"), str("filter"), str("limit"))
    .hash(str("hash"))
    .state(str("state"))
    .children({
      child: route2`settings/${str("section")}`,
    }),
  groups: route2`groups/${int("gid").optional}`.children({
    child: route2`settings/${str("section")}`,
  }),
});
// template strings is shorter:

route2("users", int("uid"), "groups", int("gid").optional);
route2`users${int("uid")}groups${int("gid").optional}`;

//
// template api
//
const root = null as any;
root.template("/_/group/settings/account/*"); // absolute nested route: /user/:uid/groud/:gid/settings/account/*
root.template("_/group/settings/account/*"); // relative nested route: user/:uid/groud/:gid/settings/account/*
root.template("_.group.settings.account.*"); // relative nested route: user/:uid/groud/:gid/settings/account/*
root.template("_/group/*"); // relative route: user/:uid/groud/:gid/*
root.template("group/<settings>/account/*"); // relative partial route: settings/account/*
root.template("group.$settings.account.*"); // relative partial route: settings/account/*

//
// render api
//

// relative route
root({ uid: 123 }).group({ gid: 12 }).settings().account(); // user/123/groud/12/settings/account

root.render(
  "_/group/settings/account",
  { uid: 321, gid: 21 },
  { search: "query" }
); // user/321/groud/21/settings/account?search=query

root.render(
  "_/group/settings/account",
  { uid: 321, gid: 21 },
  { search: "query" }
); // user/321/groud/21/settings/account?search=query

root.render("group/settings/account", { gid: 21 }); // groud/21/settings/account

root.render("group/<settings>/account"); // settings/account

// absolute path
root.absolute({ uid: 123 }).group({ gid: 12 }).settings().account(); // /user/123/groud/12/settings/account

// extend path
const userGroupRoute = root.absolute({ uid: 123 }).group({ gid: 12 });
root.extend(userGroupRoute).settings().account(); // partial route /user/123/groud/12/settings/account

// overwrite extended path parameters
const userGroupRouteB = root({ uid: 123 }).group({ gid: 12 }); // could be reconstructed from string
userGroupRouteB
  .override({ root: { params: { uid: 321 } }, group: { params: { gid: 21 } } })
  .settings()
  .account(); // partial route user/321/groud/21/settings/account

// access child route
const settings = root.get("group.settings");
settings().account(); // settings/account
settings.template("settings/account/*");

// type Test<Children extends Record<string, any>, K extends string = Extract<keyof Children, string>> = Children[K] extends number ? ("/" | "/*") : `${K}/${Test<Children[K]>}`;

// type dd =Test<{
//   lala: {
//     caracol:1
//   },
//   bobo: 2,
// }>
// type PathsToStringProps<T> = T extends string ? [] : {
//   [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>]
// }[Extract<keyof T, string>];

// type Join<T extends string[], D extends string> =
//     T extends [] ? never :
//     T extends [infer F] ? F :
//     T extends [infer F, ...infer R] ?
//     F extends string ?
//     `${F}${D}${Join<Extract<R, string[]>, D>}` : never : string;

// type dd =Join<PathsToStringProps<{
//   lala: {
//     caracol:""
//   },
//   bobo: "",
// }>, "/">;

type RootPath<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends object
      ?
          | `${K}`
          | `/${K}`
          | `${K}/*`
          | `/${K}/*`
          | `${K}/${MaybeRelativePath<T[K]>}`
          | `/${K}/${MaybeRelativePath<T[K]>}`
      : `${K}` | `/${K}`
    : never;
}[keyof T];

type MaybeRelativePath<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends object
      ?
          | `${K}`
          | `$${K}`
          | `${K}/*`
          | `$${K}/*`
          | `${K}/${MaybeRelativePath<T[K]>}`
          | `$${K}/${RelativePath<T[K]>}`
      : `${K}` | `$${K}`
    : never;
}[keyof T];

type RelativePath<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends object
      ? `${K}` | `${K}/*` | `${K}/${RelativePath<T[K]>}`
      : `${K}`
    : never;
}[keyof T];

// Example usage:
type NestedObject = {
  prop1: {
    propA: number;
    propB: {
      propX: string;
      propY: boolean;
    };
  };
  prop2: {
    prop2: {
      prop2: {
        prop2: {
          prop2: {
            prop2: {
              prop2: {
                prop2: {
                  prop2: {
                    prop2: {
                      prop2: {
                        prop2: {
                          prop2: {
                            prop2: {
                              prop2: {};
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
  prop3: {};
  [1]: {};
};

type FlattenedKeys = RootPath<NestedObject>;

const x: FlattenedKeys = "/prop3/*";

// const obj = {
//   a: {
//     b: {
//       c: {},
//     },
//   },
//   b: {
//     c: {},
//   },
//   c: {},
// };

// type NestedPaths<T, K = keyof T> = K extends string
//   ? K | `${K}.${NestedPaths<T[K]>}`
//   : never;

// const fn = <T>(obj: T, x: keyof T) => null;

// fn(obj, "c");

type NestedValueOf<Obj, Key extends string> = Obj extends object
  ? Key extends `${infer Parent}.${infer Leaf}`
    ? Parent extends keyof Obj
      ? NestedValueOf<Obj[Parent], Leaf>
      : never
    : Key extends keyof Obj
    ? Obj[Key]
    : never
  : never;

interface Residence {
  address: string;
  year: number;
  owner: {
    name: string;
  };
}

const house: Residence = {
  address: "Type street 1",
  year: 2010,
  owner: {
    name: "John Smith",
  },
};

function getProp<T, Key extends string>(
  obj: T,
  key: Key
): NestedValueOf<T, Key> {
  // TODO
  return null as any;
}
getProp(house, "year"); // string
getProp(house, "owner"); // { name: string }
getProp(house, "owner.name"); // string
getProp(house, "city"); // never
