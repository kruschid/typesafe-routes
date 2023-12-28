import { A, Test } from "ts-toolbelt";
import { expectType } from "tsd";
import {
  Param,
  Parser,
  PathSegment,
  PathToParamMap,
  SegmentToParamMap,
  ToParamsRecord,
  bool,
  int,
  createRoutes,
  str,
} from "../src";

const { checks, check } = Test;

const r = createRoutes({
  home: {},
  language: {
    path: [str("lang")],
    children: {
      users: {
        path: ["users"],
        query: [int("page")],
        children: {
          show: {
            path: ["show", int("userId")],
            query: [bool("filter").optional],
          },
        },
      },
    },
  },
});

//
// template
//
expectType<
  (
    path:
      | "home"
      | "language"
      | "language/*"
      | "language/users"
      | "language/users/*"
      | "language/_users"
      | "language/_users/*"
      | "language/_users/show"
      | "language/users/show"
      | "language/users/_show"
  ) => string
>(r.template);

//
// render
//
expectType<(path: "home", options: {}) => string>(r.render);
expectType<(path: "language", options: { path: { lang: string } }) => string>(
  r.render
);
expectType<
  (
    path: "language/users",
    options: { path: { lang: string }; query: { page: number } }
  ) => string
>(r.render);
expectType<
  (path: "language/_users", options: { query: { page: number } }) => string
>(r.render);
expectType<
  (
    path: "language/users/show",
    options: {
      path: { lang: string; userId: number };
      query: { filter?: boolean; page: number };
    }
  ) => string
>(r.render);
expectType<
  (
    path: "language/_users/show",
    options: {
      path: { userId: number };
      query: { filter?: boolean; page: number };
    }
  ) => string
>(r.render);
expectType<
  (
    path: "language/users/_show",
    options: {
      path: { userId: number };
      query: { filter?: boolean };
    }
  ) => string
>(r.render);

//
// params
//
expectType<{}>(r.params("home", {}));
expectType<{ lang: string }>(r.params("language", {}));
expectType<{ lang: string }>(r.params("language/users", {}));
expectType<{ lang: string; userId: number }>(
  r.params("language/users/show", {})
);
expectType<{}>(r.params("language/_users", {}));
expectType<{ userId: number }>(r.params("language/_users/show", {}));
expectType<{ userId: number }>(r.params("language/users/_show", {}));

//
// query
//
expectType<{}>(r.query("home", {}));
expectType<{}>(r.query("language", {}));
expectType<{}>(r.query("language/users", {}));
expectType<{ filter?: boolean; page: number }>(
  r.query("language/users/show", {})
);
expectType<{ page: number }>(r.query("language/_users", {}));
expectType<{ filter?: boolean; page: number }>(
  r.query("language/_users/show", {})
);
expectType<{ filter?: boolean }>(r.query("language/users/_show", {}));

//
// bind
//
r.bind("language", { path: { lang: "" } })
  .bind("users", { query: { page: 1 } })
  .render("show", { path: { userId: 1 }, query: { filter: true } });

//
// from
//
r.from("language/users", "de/users/5?page=2", {
  path: { lang: "" },
  query: { page: 1 },
}).render("show", { path: { userId: 2 }, query: {} });

//
// SegmentToParamMap
//
checks([
  // required and optional path params
  check<
    A.Compute<
      SegmentToParamMap<{
        path: [
          "user",
          Param<"uid", string, "required">,
          Param<"gid", number, "optional">
        ];
      }>
    >,
    {
      path: {
        uid: string;
        gid?: number;
      };
      query: {};
    },
    Test.Pass
  >(),
  // required and optional query param
  check<
    A.Compute<
      SegmentToParamMap<{
        path: [
          "user",
          Param<"uid", string, "required">,
          Param<"gid", number, "optional">
        ];
        query: [
          Param<"filter", string, "required">,
          Param<"page", number, "optional">
        ];
      }>
    >,
    {
      path: {
        uid: string;
        gid?: number;
      };
      query: {
        filter: string;
        page?: number;
      };
    },
    Test.Pass
  >(),
]);

//
// ToParamsRecord
//
checks([
  // required
  check<
    A.Compute<
      ToParamsRecord<{ name: "uid"; kind: "required"; parser: Parser<string> }>
    >,
    { uid: string },
    Test.Pass
  >(),
  // optional
  check<
    A.Compute<
      ToParamsRecord<{ name: "gid"; kind: "optional"; parser: Parser<string> }>
    >,
    { gid?: string },
    Test.Pass
  >(),
  // mixed
  check<
    A.Compute<
      ToParamsRecord<
        | { name: "uid"; kind: "required"; parser: Parser<string> }
        | { name: "gid"; kind: "optional"; parser: Parser<string> }
      >
    >,
    { uid: string; gid?: string },
    Test.Pass
  >(),
]);

//
// PathSegment
//
checks([
  // template
  check<
    PathSegment<
      {
        blog: {};
        home: { children: { user: { children: { settings: {} } } } };
      },
      true
    >,
    | "blog"
    | "home"
    | "home/user"
    | "home/user/settings"
    | "home/user/*"
    | "home/user/_settings"
    | "home/*"
    | "home/_user"
    | "home/_user/settings"
    | "home/_user/*",
    Test.Pass
  >(),
  // path
  check<
    PathSegment<{
      blog: {};
      home: { children: { user: { children: { settings: {} } } } };
    }>,
    | "blog"
    | "home"
    | "home/user"
    | "home/user/settings"
    | "home/user/_settings"
    | "home/_user"
    | "home/_user/settings",
    Test.Pass
  >(),
]);

//
// PathToParamMap
//
checks([
  check<
    A.Compute<
      PathToParamMap<
        "home/user",
        {
          home: {
            path: ["home"];
            query: [Param<"q", string, "optional">];
            children: { user: { path: ["user", Param<"uid", string>] } };
          };
        }
      >
    >,
    {
      path: {
        uid: string;
      };
      query: {
        q?: string;
      };
    },
    Test.Pass
  >(),
]);
