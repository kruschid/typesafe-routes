import { A, Test } from "ts-toolbelt";
import { Param } from "../src/param";
import { ToParamMap, routes } from "../src/routes";
import { bool, int, str } from "../src/parser";
import { expectType } from "tsd";

const { checks, check } = Test;

const r = routes({
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
// build
//
expectType<(path: "home", options: {}) => string>(r.build);
expectType<(path: "language", options: { path: { lang: string } }) => string>(
  r.build
);
expectType<
  (
    path: "language/users",
    options: { path: { lang: string }; query: { page: number } }
  ) => string
>(r.build);
expectType<
  (path: "language/_users", options: { query: { page: number } }) => string
>(r.build);
expectType<
  (
    path: "language/users/show",
    options: {
      path: { lang: string; userId: number };
      query: { filter?: boolean; page: number };
    }
  ) => string
>(r.build);
expectType<
  (
    path: "language/_users/show",
    options: {
      path: { userId: number };
      query: { filter?: boolean; page: number };
    }
  ) => string
>(r.build);
expectType<
  (
    path: "language/users/_show",
    options: {
      path: { userId: number };
      query: { filter?: boolean };
    }
  ) => string
>(r.build);

//
// render
//
expectType<(path: "home") => string>(r.render);
expectType<(path: "language", params: { lang: string }) => string>(r.render);
expectType<
  (
    path: "language/users",
    params: { lang: string },
    query: { page: number }
  ) => string
>(r.render);
expectType<(path: "language/_users", query: { page: number }) => string>(
  r.render
);

//
// params
//
expectType<{ path: {}; query: {} }>(r.params("home"));
expectType<{ path: { lang: string }; query: {} }>(r.params("language"));
expectType<{ path: { lang: string }; query: {} }>(r.params("language/users"));
expectType<{
  path: { lang: string; userId: number };
  query: { filter?: boolean; page: number };
}>(r.params("language/users/show"));
expectType<{ path: {}; query: { page: number } }>(r.params("language/_users"));
expectType<{
  path: { userId: number };
  query: { filter?: boolean; page: number };
}>(r.params("language/_users/show"));
expectType<{
  path: { userId: number };
  query: { filter?: boolean };
}>(r.params("language/users/_show"));

//
// ToParamMap
//
checks([
  // required and optional path params
  check<
    A.Compute<
      ToParamMap<{
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
      ToParamMap<{
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
