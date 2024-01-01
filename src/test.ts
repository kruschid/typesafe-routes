import test from "tape";
import { bool, date, int, isoDate, str } from "./parser";
import { createRoutes } from "./routes";

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

test("render with default renderer", (t) => {
  t.plan(7);

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
  t.equal(
    routes.render("blog/_category/date", {
      path: { cid: "movies", date: new Date(1703798091000) },
      query: { page: 42 },
    }),
    "category/movies/2023-12-28?page=42"
  );
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
              path: [isoDate("date").optional],
            },
          },
        },
      },
    },
  });

  t.throws(
    () => routes.bind("home", {}),
    "should throw when binding childless segments"
  );
  t.equal(
    routes
      .bind("blog/category", { path: { cid: "movies", lang: "en" } })
      .render("date", { path: { date: new Date(1703798091000) } }),
    "/blog/en/category/movies/2023-12-28T21:14:51.000Z"
  );
  t.equal(
    routes
      .bind("blog", { path: { lang: "en" } })
      .bind("category", { path: { cid: "movies" } })
      .render("date", { path: { date: new Date(1703798091000) } }),
    "/blog/en/category/movies/2023-12-28T21:14:51.000Z"
  );
  t.equal(
    routes
      .bind("blog/_category", { path: { cid: "movies" } })
      .render("date", { path: { date: new Date(1703798091000) } }),
    "category/movies/2023-12-28T21:14:51.000Z"
  );
  t.equal(
    routes
      .bind("blog/_category", { path: { cid: "movies" } })
      .render("date", { path: {} }),
    "category/movies"
  );
});

test("parsing path params", (t) => {
  t.end();
});

test("parsing query params", (t) => {
  t.end();
});

test("parsing query params", (t) => {
  t.end();
});

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
