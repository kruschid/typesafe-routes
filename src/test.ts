import test from "tape";
import { date, int, isoDate, str } from "./parser";
import { createRoutes } from "./routes";

// import {
//   booleanParser,
//   dateParser,
//   intParser,
//   recursiveRoute,
//   route,
//   stringParser,
// } from ".";

// test("commonjs imports in strict mode", (t) => {
//   // https://github.com/kruschid/typesafe-routes/issues/3
//   t.plan(2);

//   const { route: routeCJS } = require(".");
//   t.equal(routeCJS("/root", {}, {})({}).$, "/root");
//   t.equal(require(".").route("/root", {}, {})({}).$, "/root");
// });

test("templates with default renderer", (t) => {
  t.plan(8);

  const routes = createRoutes({
    home: {},
    blog: {
      path: ["blog", str("lang")],
      children: {
        category: {
          path: ["category", str("cid")],
          children: {
            date: {
              path: [isoDate("date")],
            },
          },
        },
      },
    },
  });

  t.equal(routes.template("home"), "/");
  t.equal(routes.template("blog"), "/blog/:lang");
  t.equal(routes.template("blog/*"), "/blog/:lang/*");
  t.equal(
    routes.template("blog/category/date"),
    "/blog/:lang/category/:cid/:date"
  );
  t.equal(routes.template("blog/category/*"), "/blog/:lang/category/:cid/*");
  t.equal(routes.template("blog/_category/*"), "category/:cid/*");
  t.equal(routes.template("blog/_category/date"), "category/:cid/:date");
  t.equal(routes.template("blog/category/_date"), ":date");
});

test.only("render with default renderer", (t) => {
  // t.plan(3);

  const routes = createRoutes({
    home: {},
    blog: {
      path: ["blog", str("lang")],
      children: {
        category: {
          path: ["category", str("cid")],
          query: [str("search").optional],
          children: {
            date: {
              path: [date("date")],
              query: [int("page")],
            },
          },
        },
      },
    },
  });

  t.equal(routes.render("home", {}), "/");
  t.equal(routes.render("blog", { path: { lang: "en" } }), "/blog/en");
  t.equal(
    routes.render("blog/category", {
      path: { lang: "en", cid: "movies" },
      query: {},
    }),
    "/blog/en/category/movies"
  );
  t.equal(
    routes.render("blog/category", {
      path: { lang: "en", cid: "movies" },
      query: { search: "robocop" },
    }),
    "/blog/en/category/movies?search=robocop"
  );
  t.equal(
    routes.render("blog/category/date", {
      path: { lang: "en", cid: "movies", date: new Date(1703798091000) },
      query: { search: "robocop", page: 42 },
    }),
    "/blog/en/category/movies/2023-12-28?search=robocop&page=42"
  );
  t.equal(
    routes.render("blog/_category/date", {
      path: { cid: "movies", date: new Date(1703798091000) },
      query: { search: "robocop", page: 42 },
    }),
    "category/movies/2023-12-28?search=robocop&page=42"
  );
  t.end();
});

test("bind with default renderer", (t) => {
  t.plan(5);

  const routes = createRoutes({
    home: {},
    blog: {
      path: ["blog", str("lang")],
      children: {
        category: {
          path: ["category", str("cid")],
          children: {
            date: {
              path: [isoDate("date")],
            },
          },
        },
      },
    },
  });

  t.equal(routes.bind("home", {}), "/"); // should throw
  t.equal(
    routes
      .bind("blog/category", { path: { cid: "movies", lang: "en" } })
      .render("date", { path: { date: new Date(1703798091000) } }),
    "/"
  );
});
// test("nested routes", (t) => {
//   t.plan(3);

//   const accountRoute = route("account", {}, {});
//   const settingsRoute = route(
//     "settings/:settingsId",
//     { settingsId: stringParser },
//     { accountRoute }
//   );
//   const groupRoute = route(
//     "/group/:groupId?&:filter?&:limit",
//     {
//       groupId: stringParser,
//       filter: booleanParser,
//       limit: intParser,
//     },
//     {
//       settingsRoute,
//     }
//   );

//   t.equal(
//     groupRoute({ filter: true, limit: 20, groupId: "groupId" })
//       .settingsRoute({ settingsId: "settingsId" })
//       .accountRoute({}).$,
//     "/group/groupId/settings/settingsId/account?filter=true&limit=20",
//     "should match nested route"
//   );
//   t.equal(
//     groupRoute({ limit: 30 })
//       .settingsRoute({ settingsId: "settingsId" })
//       .accountRoute({}).$,
//     "/group/settings/settingsId/account?limit=30",
//     "should respect optional params"
//   );

//   const rootRoute = route("/", {}, { account: accountRoute });
//   t.equal(rootRoute({}).account({}).$, "/account");
// });

// test("recursive routes", (t) => {
//   t.plan(1);

//   const nodeRoute = recursiveRoute("/node/:nodeId", { nodeId: intParser }, {});

//   t.equal(
//     nodeRoute({ nodeId: 1 })
//       .$self({ nodeId: 2 })
//       .$self({ nodeId: 3 })
//       .$self({ nodeId: 4 }).$,
//     "/node/1/node/2/node/3/node/4",
//     "should match recursive route"
//   );
// });

// test("param parser", (t) => {
//   t.plan(6);

//   const groupRoute = route(
//     "group/:groupId?&:filter?&:limit&:date?",
//     {
//       groupId: stringParser,
//       filter: booleanParser,
//       limit: intParser,
//       date: dateParser,
//     },
//     {}
//   );

//   t.deepEqual(
//     groupRoute.parseParams({
//       limit: "99",
//       filter: "true",
//       groupId: "abc",
//       date: "2020-10-02T10:29:50Z",
//     }),
//     {
//       limit: 99,
//       filter: true,
//       groupId: "abc",
//       date: new Date("2020-10-02T10:29:50Z"),
//     },
//     "should parse params"
//   );

//   t.deepEqual(
//     groupRoute.parseParams({ limit: "9" }),
//     { limit: 9 },
//     "should skip optional params"
//   );

//   t.deepEqual(
//     groupRoute.parseParams({ limit: "9", extra: 1 } as any),
//     { limit: 9 },
//     "should not throw if additional params were provided"
//   );

//   t.throws(
//     () => groupRoute.parseParams({} as any, true),
//     "should throw error in strict mode"
//   );

//   t.deepEqual(
//     groupRoute.parsePathParams({
//       groupId: "abc",
//     }),
//     {
//       groupId: "abc",
//     },
//     "should only return path params"
//   );

//   t.deepEqual(
//     groupRoute.parseQueryParams({
//       limit: "99",
//       filter: "true",
//       date: "2020-10-02T10:29:50Z",
//     }),
//     {
//       limit: 99,
//       filter: true,
//       date: new Date("2020-10-02T10:29:50Z"),
//     },
//     "should only return query params"
//   );
// });

// test("template", (t) => {
//   t.plan(1);

//   const settingsRoute = route(
//     "settings/:settingsId",
//     { settingsId: stringParser },
//     {}
//   );
//   const groupRoute = route(
//     "group/:groupId?&:filter?&:limit",
//     {
//       groupId: stringParser,
//       filter: booleanParser,
//       limit: intParser,
//     },
//     {
//       settingsRoute,
//     }
//   );

//   t.deepEqual(
//     [settingsRoute.template, groupRoute.template],
//     ["settings/:settingsId", "group/:groupId?"],
//     "should match templates"
//   );

//   // const [settingsRoute, settingsTemplate] = route("settings/:settingsId", {} , {...children});
//   // settingsTemplate.childA.childB.$
// });

// test("serializer", (t) => {
//   t.plan(1);

//   const groupRoute = route(
//     "group/:groupId?&:limit",
//     {
//       groupId: stringParser,
//       limit: intParser,
//     },
//     {}
//   );

//   t.equal(
//     groupRoute({ groupId: "abc", limit: 0 }).$,
//     "group/abc?limit=0",
//     "should serialize 0"
//   );
// });
