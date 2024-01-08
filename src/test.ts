import test from "tape";
import { createRoutes } from "./createRoutes";
import { date, int, isoDate, str } from "./parser";

test("templates with default renderer", (t) => {
  t.plan(8);

  const routes = createRoutes({
    home: {},
    blog: {
      path: ["blog", str("lang")],
      children: {
        "*": { template: "**" },
        category: {
          path: ["category", str("cid")],
          children: {
            "*": { template: "**" },
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
  t.equal(routes.template("blog/*"), "/blog/:lang/**");
  t.equal(
    routes.template("blog/category/date"),
    "/blog/:lang/category/:cid/:date"
  );
  t.equal(routes.template("blog/category/*"), "/blog/:lang/category/:cid/**");
  t.equal(routes.template("blog/_category/*"), "category/:cid/**");
  t.equal(routes.template("blog/_category/date"), "category/:cid/:date");
  t.equal(routes.template("blog/category/_date"), ":date");
});

test("render with default renderer", (t) => {
  t.plan(8);

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

  t.equal(routes.render(), "/", "renders home route on empty context");
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

  t.equal(routes.bind("home", {}).render(), "/");
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

test("from", (t) => {
  const routes = createRoutes({
    home: {},
    blog: {
      path: ["blog", str("lang")],
      children: {
        category: {
          path: ["category", str("cid").optional],
          query: [str("search").optional],
          children: {
            date: {
              path: ["date", date("date")],
              query: [int("page").optional],
            },
          },
        },
      },
    },
  });

  t.equal(routes.from("blog", "/blog/de", { path: {} }).render(), "/blog/de");
  t.equal(
    routes
      .from("blog", "/blog/de", {
        path: { lang: "en" },
      })
      .render(),
    "/blog/en"
  );
  t.equal(
    routes
      .from("blog/category", "/blog/de/category/music", {
        query: {},
        path: { cid: "movies", lang: "en" },
      })
      .render(),
    "/blog/en/category/movies"
  );
  t.equal(
    routes
      .from("blog/category/date", "/blog/de/category/date/2023-12-31", {
        query: {},
        path: { cid: "movies", lang: "en", date: new Date("2024-01-01") },
      })
      .render(),
    "/blog/en/category/movies/date/2024-01-01",
    "skip optional path parameters"
  );
  t.equal(
    routes
      .from("blog/_category/date", "category/music/date/2023-12-31", {
        query: {},
        path: { cid: "movies", date: new Date("2024-01-01") },
      })
      .render(),
    "category/movies/date/2024-01-01"
  );
  t.equal(
    routes
      .from("blog/_category/date", "category/music/date/2023-12-31", {
        query: { page: 1, search: "abc" },
        path: { cid: "movies", date: new Date("2024-01-01") },
      })
      .render(),
    "category/movies/date/2024-01-01?search=abc&page=1"
  );

  const routesWithOptionalParams = createRoutes({
    user: {
      path: ["user", str("uid").optional],
      children: {
        setting: {
          path: ["settings", str("sid").optional],
          children: {
            group: {
              path: [str("gid").optional, "group"],
            },
          },
        },
      },
    },
  });
  t.equal(
    routesWithOptionalParams
      .from("user/setting/group", "/user/settings/group", {
        path: {},
      })
      .render(),
    "/user/settings/group"
  );
  t.equal(
    routesWithOptionalParams
      .from("user/setting/group", "/user/settings/group", {
        path: { gid: "admins" },
      })
      .render(),
    "/user/settings/admins/group"
  );
  t.equal(
    routesWithOptionalParams
      .from("user/setting/group", "/user/root/settings/group", {
        path: { uid: "kruschid" },
      })
      .render(),
    "/user/kruschid/settings/group"
  );
  t.equal(
    routesWithOptionalParams
      .from("user/setting/group", "/user/root/settings/queue/group", {
        path: {},
      })
      .render(),
    "/user/root/settings/queue/group"
  );
  t.equal(
    routesWithOptionalParams
      .from("user/_setting/group", "settings/queue/admins/group", {
        path: {},
      })
      .render(),
    "settings/queue/admins/group"
  );
  t.equal(
    routesWithOptionalParams
      .from("user/_setting/group", "settings/queue/admins/group", {
        path: { gid: "clients", sid: "leads" },
      })
      .render(),
    "settings/leads/clients/group"
  );
  t.end();
});
