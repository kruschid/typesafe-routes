import test from "tape";
import {
  Renderer,
  bool,
  createRoutes,
  date,
  float,
  int,
  isoDate,
  list,
  oneOf,
  str,
} from ".";

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
    routes.render("blog/category/date", {
      path: { lang: "en", cid: "movies", date: new Date(1703798091000) },
      query: { search: "robocop", page: 0 },
    }),
    "/blog/en/category/movies/2023-12-28?search=robocop&page=0",
    "falsy parameters should be rendered"
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

  t.end();
});

test("bind with default renderer", (t) => {
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

  t.end();
});

test("parsing path params", (t) => {
  const routes = createRoutes({
    home: {},
    blog: {
      path: ["blog", bool("lang")],
      children: {
        category: {
          path: ["category", int("cid").optional],
          children: {
            date: {
              path: ["date", date("date").optional],
            },
          },
        },
      },
    },
  });

  t.deepEqual(
    routes.parseParams("blog/category/date", {
      lang: "true",
      cid: "42",
      date: "2023-12-28",
    }),
    {
      lang: true,
      cid: 42,
      date: new Date("2023-12-28T00:00:00.000Z"),
    }
  );

  t.deepEqual(
    routes.parseParams("blog/category/date", {
      lang: "true",
      cid: "0",
      date: "2023-12-28",
    }),
    {
      lang: true,
      cid: 0,
      date: new Date("2023-12-28T00:00:00.000Z"),
    }
  );

  t.deepEqual(
    routes.parseParams("blog/_category/date", {
      cid: "42",
    }),
    { cid: 42 }
  );

  t.deepEqual(
    routes.parseParams("blog/_category/date", {
      cid: "42",
    }),
    { cid: 42 }
  );

  t.end();
});

test("parsing query params", (t) => {
  const routes = createRoutes({
    home: {},
    blog: {
      path: ["blog"],
      query: [str("lang")],
      children: {
        category: {
          path: ["movies"],
          query: [str("category"), bool("shortmovie")],
          children: {
            date: {
              path: ["2023"],
              query: [oneOf("jan", "feb", "mar", "apr", "...")("month")],
            },
          },
        },
      },
    },
  });

  t.deepEqual(
    routes.parseQuery("blog/category/date", {
      lang: "en",
      category: "drama",
      shortmovie: "true",
      month: "feb",
    }),
    {
      lang: "en",
      category: "drama",
      shortmovie: true,
      month: "feb",
    }
  );

  t.deepEqual(
    routes.parseQuery("blog/_category/date", {
      lang: "en",
      category: "drama",
      shortmovie: "true",
      month: "feb",
    }),
    {
      category: "drama",
      shortmovie: true,
      month: "feb",
    }
  );

  t.throws(() => routes.parseQuery("blog/category/_date", {}));
  t.throws(() => routes.parseQuery("blog/category/_date", { month: "jun" }));

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
      .from("blog/category", "/blog/de/category/music/date/5", {
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
      .bind("blog", { path: { lang: "en" } })
      .from("category/date", "category/music/date/2023-12-31", {
        query: {},
        path: { cid: "movies", date: new Date("2024-01-01") },
      })
      .render(),
    "/blog/en/category/movies/date/2024-01-01",
    "should take context from bind method"
  );
  t.equal(
    routes
      .from("blog", "blog/de", { path: { lang: "en" } })
      .bind("category/date", {
        query: {},
        path: { cid: "movies", date: new Date("2024-01-01") },
      })
      .render(),
    "/blog/en/category/movies/date/2024-01-01",
    "should pass context to bind method"
  );
  t.equal(
    routes
      .from("blog", "blog/de", { path: { lang: "en" } })
      .from("category", "category/music", {
        query: {},
        path: { cid: "movies" },
      })
      .from("date", "date/2023-12-31")
      .render(),
    "/blog/en/category/movies/date/2023-12-31",
    "should chain multiple from calls"
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

test("replace", (t) => {
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

  t.equal(
    routes.replace(
      "blog/category",
      "/blog/en/category/movies/date/2012-12-28?search=batman&page=1",
      { path: { cid: "art" }, query: {} }
    ),
    "/blog/en/category/art/date/2012-12-28?search=batman&page=1",
    "should replace path params in absolute path"
  );

  t.equal(
    routes.replace(
      "blog/_category/date",
      "category/movies/date/2012-12-28?search=batman&page=1",
      { path: { cid: "art" }, query: {} }
    ),
    "category/art/date/2012-12-28?search=batman&page=1",
    "should replace params in relative path"
  );

  t.equal(
    routes.replace("blog", "/blog/en?additionalParam=value", {
      path: { lang: "es" },
    }),
    "/blog/es?additionalParam=value",
    "should keep additional params"
  );

  t.equal(
    routes.replace(
      "blog/_category/date",
      "category/movies/date/2012-12-28?search=batman&page=1",
      { path: { cid: "art" }, query: { search: undefined } }
    ),
    "category/art/date/2012-12-28?page=1",
    "should remove param"
  );

  t.throws(
    () =>
      routes.replace("blog/_category/date", "category/movies/date/2012-12-28", {
        path: { date: undefined },
        query: {},
      }),
    "throws when deleting a required parameter"
  );

  ("should replace query params in absolute path");
  ("should replace query params in relative path");
  ("should replace path & query params in absolute path");
  ("should replace path & query params in relative path");
  t.end();
});

test("params", (t) => {
  const i = int("").parser;
  t.equal(i.parse("5.4"), 5, "int should parse");
  t.equal(i.serialize(5), "5", "int should serialize");
  t.throws(() => i.parse("abc"), "int should validate");

  const f2 = float(2)("").parser;
  t.equal(f2.parse("5.43"), 5.43, "float should parse");
  t.equal(f2.serialize(5.4), "5.40", "float should serialize");
  t.throws(() => f2.parse("abc"), "float should validate");

  const d = isoDate("").parser;
  t.deepEqual(
    d.parse("2024-01-29T17:27:22.302Z"),
    new Date("2024-01-29T17:27:22.302Z"),
    "isoDate should parse"
  );
  t.equal(
    d.serialize(new Date("2024-01-29T17:27:22.302Z")),
    "2024-01-29T17:27:22.302Z",
    "isoDate should serialize"
  );
  t.throws(() => d.parse("abc"), "isoDate should validate");

  const b = bool("").parser;
  t.deepEqual(b.parse("true"), true, "bool should parse");
  t.equal(b.serialize(false), "false", "bool should serialize");

  const o = oneOf("a", "b", "c")("").parser;
  t.equal(o.parse("b"), "b", "oneOf should parse");
  t.equal(o.serialize("c"), "c", "oneOf should serialize");
  t.throws(() => o.parse("d"), "oneOf should validate");

  const l = list(["a", "b", "c"], "|")("").parser;
  t.deepEqual(l.parse("b|c"), ["b", "c"], "list should parse");
  t.equal(l.serialize(["a", "c"]), "a|c", "list should serialize");
  t.throws(() => l.parse("d|e|f"), "list should validate");

  t.end();
});

test("renderer customization", (t) => {
  const renderer: Renderer<{ href: string; pathname: string; search: string }> =
    {
      template: ({ pathSegments, isRelative }, options) => {
        const template = pathSegments
          .map((pathSegment) =>
            typeof pathSegment === "string"
              ? pathSegment
              : `:${pathSegment.name}${
                  pathSegment.kind === "optional" ? "?" : ""
                }`
          )
          .join("/");

        return isRelative || options?.templatePrefix
          ? template //relative
          : `/${template}`; // absolute
      },
      render: ({ pathSegments, isRelative, pathParams, queryParams }) => {
        const path: string[] = [];
        // path params
        pathSegments.forEach((pathSegment) => {
          if (typeof pathSegment === "string") {
            path.push(pathSegment);
          } else if (pathParams[pathSegment.name] != null) {
            path.push(pathParams[pathSegment.name]);
          }
        });

        const searchParams = new URLSearchParams(queryParams).toString();

        const pathname = (isRelative ? "" : "/") + path.join("/");
        const search = (searchParams ? `?` : "") + searchParams;
        const href = pathname + search;

        return { pathname, search, href };
      },
    };

  const routes = createRoutes(
    {
      home: {},
      blog: {
        path: ["blog", str("lang")],
        children: {
          category: {
            path: ["category", str("cid").optional],
            query: [str("search").optional],
          },
        },
      },
    },
    { renderer }
  );

  t.deepEqual(
    routes.render("blog/category", {
      path: { lang: "en" },
      query: { search: "hello" },
    }),
    {
      pathname: "/blog/en/category",
      search: "?search=hello",
      href: "/blog/en/category?search=hello",
    }
  );

  t.end();
});
