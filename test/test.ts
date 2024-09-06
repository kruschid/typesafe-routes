import test from "tape";
import {
  AnyRenderContext,
  bool,
  createRoutes,
  date,
  defaultContext,
  float,
  int,
  isoDate,
  list,
  oneOf,
  str,
} from "../src";

test("templates with default renderer", (t) => {
  const routes = createRoutes({
    home: {},
    blog: {
      path: ["blog", str("lang")],
      children: {
        _wildcard: { template: "**" },
        category: {
          path: ["category", str("cid")],
          children: {
            _wildcard: { template: "**" },
            date: {
              path: [isoDate("date")],
            },
          },
        },
      },
    },
  });

  t.equal(routes.home.$template(), "/");
  t.equal(routes.blog.$template(), "/blog/:lang");
  t.equal(routes.blog._wildcard.$template(), "/blog/:lang/**");
  t.equal(
    routes.blog.category.date.$template(),
    "/blog/:lang/category/:cid/:date"
  );
  t.equal(
    routes.blog.category._wildcard.$template(),
    "/blog/:lang/category/:cid/**"
  );
  t.equal(routes.blog._.category._wildcard.$template(), "category/:cid/**");
  t.equal(routes.blog._.category.date.$template(), "category/:cid/:date");
  t.equal(routes.blog.category._.date.$template(), ":date");
  t.end();
});

test("render with default renderer", (t) => {
  const routes = createRoutes({
    home: {},
    blog: {
      path: ["blog", str("lang")],
      children: {
        category: {
          path: ["category", str("cid")],
          query: [str.optional("search")],
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

  t.equal(routes.$render({}), "/", "renders home route on empty context");
  t.equal(routes.home.$render({}), "/");
  t.equal(routes.blog.$render({ path: { lang: "en" } }), "/blog/en");
  t.equal(
    routes.blog.category.$render({
      path: { lang: "en", cid: "movies" },
      query: {},
    }),
    "/blog/en/category/movies"
  );
  t.equal(
    routes.blog.category.$render({
      path: { lang: "en", cid: "movies" },
      query: { search: "robocop" },
    }),
    "/blog/en/category/movies?search=robocop"
  );
  t.equal(
    routes.blog.category.date.$render({
      path: { lang: "en", cid: "movies", date: new Date(1703798091000) },
      query: { search: "robocop", page: 42 },
    }),
    "/blog/en/category/movies/2023-12-28?search=robocop&page=42"
  );
  t.equal(
    routes.blog.category.date.$render({
      path: { lang: "en", cid: "movies", date: new Date(1703798091000) },
      query: { search: "robocop", page: 0 },
    }),
    "/blog/en/category/movies/2023-12-28?search=robocop&page=0",
    "falsy parameters should be rendered"
  );
  t.equal(
    routes.blog._.category.date.$render({
      path: { cid: "movies", date: new Date(1703798091000) },
      query: { search: "robocop", page: 42 },
    }),
    "category/movies/2023-12-28?search=robocop&page=42"
  );
  t.equal(
    routes.blog._.category.date.$render({
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
              path: [isoDate.optional("date")],
            },
          },
        },
      },
    },
  });

  t.equal(routes.home.$bind({}).$render({}), "/");
  t.equal(
    routes.blog.category
      .$bind({ path: { cid: "movies", lang: "en" } })
      .date.$render({ path: { date: new Date(1703798091000) } }),
    "/blog/en/category/movies/2023-12-28T21:14:51.000Z"
  );
  t.equal(
    routes.blog
      .$bind({ path: { lang: "en" } })
      .category.$bind({ path: { cid: "movies" } })
      .date.$render({ path: { date: new Date(1703798091000) } }),
    "/blog/en/category/movies/2023-12-28T21:14:51.000Z"
  );
  t.equal(
    routes.blog._.category
      .$bind({ path: { cid: "movies" } })
      .date.$render({ path: { date: new Date(1703798091000) } }),
    "category/movies/2023-12-28T21:14:51.000Z"
  );
  t.equal(
    routes.blog._.category
      .$bind({ path: { cid: "movies" } })
      .date.$render({ path: {} }),
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
          path: ["category", int.optional("cid")],
          children: {
            date: {
              path: ["date", date.optional("date")],
            },
          },
        },
      },
    },
  });

  t.deepEqual(
    routes.blog.category.date.$parseParams({
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
    routes.blog.category.date.$parseParams(
      "blog/false/category/24/date/2024-11-29"
    ),
    {
      lang: false,
      cid: 24,
      date: new Date("2024-11-29T00:00:00.000Z"),
    }
  );

  t.deepEqual(
    routes.blog.category.date.$parseParams({
      lang: "true",
      cid: "0", // potentially falsy
      date: "2023-12-28",
    }),
    {
      lang: true,
      cid: 0,
      date: new Date("2023-12-28T00:00:00.000Z"),
    }
  );

  t.deepEqual(
    routes.blog.category.date.$parseParams(
      "blog/true/category/0/date/2024-11-29"
    ),
    {
      lang: true,
      cid: 0,
      date: new Date("2024-11-29T00:00:00.000Z"),
    }
  );

  t.deepEqual(
    routes.blog._.category.date.$parseParams({
      cid: "42",
    }),
    { cid: 42 },
    "relative path with optional params"
  );

  t.deepEqual(
    routes.blog._.category.date.$parseParams("category/42/date"),
    {
      cid: 42,
    },
    "relative path with omitted optional params in string path"
  );

  t.deepEqual(
    routes.blog._.category.date.$parseParams("category/244/date/2024-10-29"),
    {
      cid: 244,
      date: new Date("2024-10-29T00:00:00.000Z"),
    },
    "relative path with all optional params in string path"
  );

  t.throws(
    () =>
      routes.blog.category._.date.$parseParams("category/244/date/2024-10-29"),
    "string path mismatch"
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
    routes.blog.category.date.$parseQuery({
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
    routes.blog.category.date.$parseQuery(
      "lang=en&category=drama&shortmovie=true&month=feb"
    ),
    {
      lang: "en",
      category: "drama",
      shortmovie: true,
      month: "feb",
    }
  );

  t.deepEqual(
    routes.blog._.category.date.$parseQuery({
      lang: "en", // ignores additional params
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

  t.deepEqual(
    routes.blog._.category.date.$parseQuery(
      "category=drama&shortmovie=true&month=feb"
    ),
    {
      category: "drama",
      shortmovie: true,
      month: "feb",
    }
  );

  t.throws(() => routes.blog.category._.date.$parseQuery({}));
  t.throws(() => routes.blog.category._.date.$parseQuery({ month: "jun" }));
  t.throws(() => routes.blog._.category.date.$parseQuery("lang=en&category"));

  t.end();
});

test("from", (t) => {
  const routes = createRoutes({
    home: {},
    blog: {
      path: ["blog", str("lang")],
      children: {
        category: {
          path: ["category", str.optional("cid")],
          query: [str.optional("search")],
          children: {
            date: {
              path: ["date", date("date")],
              query: [int.optional("page")],
            },
          },
        },
      },
    },
  });

  t.equal(routes.blog.$from("/blog/de", { path: {} }).$render({}), "/blog/de");
  t.equal(
    routes.blog
      .$from("/blog/de", {
        path: { lang: "en" },
      })
      .$render({}),
    "/blog/en"
  );
  t.equal(
    routes.blog.category
      .$from("/blog/de/category/music/date/5", {
        query: {},
        path: { cid: "movies", lang: "en" },
      })
      .$render({}),
    "/blog/en/category/movies"
  );
  t.equal(
    routes.blog.category.date
      .$from("/blog/de/category/date/2023-12-31", {
        query: {},
        path: { cid: "movies", lang: "en", date: new Date("2024-01-01") },
      })
      .$render({}),
    "/blog/en/category/movies/date/2024-01-01",
    "skip optional path parameters"
  );
  t.equal(
    routes.blog._.category.date
      .$from("category/music/date/2023-12-31", {
        query: {},
        path: { cid: "movies", date: new Date("2024-01-01") },
      })
      .$render({}),
    "category/movies/date/2024-01-01"
  );
  t.equal(
    routes.blog
      .$bind({ path: { lang: "en" } })
      .category.date.$from("category/music/date/2023-12-31", {
        query: {},
        path: { cid: "movies", date: new Date("2024-01-01") },
      })
      .$render({}),
    "/blog/en/category/movies/date/2024-01-01",
    "should take context from bind method"
  );
  t.equal(
    routes.blog
      .$from("blog/de", { path: { lang: "en" } })
      .category.date.$bind({
        query: {},
        path: { cid: "movies", date: new Date("2024-01-01") },
      })
      .$render({}),
    "/blog/en/category/movies/date/2024-01-01",
    "should pass context to bind method"
  );
  t.equal(
    routes.blog
      .$from("blog/de", { path: { lang: "en" } })
      .category.$from("category/music", {
        query: {},
        path: { cid: "movies" },
      })
      .date.$from("date/2023-12-31", { path: {}, query: {} })
      .$render({}),
    "/blog/en/category/movies/date/2023-12-31",
    "should chain multiple from calls"
  );
  t.equal(
    routes.blog._.category.date
      .$from("category/music/date/2023-12-31", {
        query: { page: 1, search: "abc" },
        path: { cid: "movies", date: new Date("2024-01-01") },
      })
      .$render({}),
    "category/movies/date/2024-01-01?search=abc&page=1"
  );

  const routesWithOptionalParams = createRoutes({
    user: {
      path: ["user", str.optional("uid")],
      children: {
        setting: {
          path: ["settings", str.optional("sid")],
          children: {
            group: {
              path: [str.optional("gid"), "group"],
            },
          },
        },
      },
    },
  });
  t.equal(
    routesWithOptionalParams.user.setting.group
      .$from("/user/settings/group", {
        path: {},
      })
      .$render({}),
    "/user/settings/group"
  );
  t.equal(
    routesWithOptionalParams.user.setting.group
      .$from("/user/settings/group", {
        path: { gid: "admins" },
      })
      .$render({}),
    "/user/settings/admins/group"
  );
  t.equal(
    routesWithOptionalParams.user.setting.group
      .$from("/user/root/settings/group", {
        path: { uid: "kruschid" },
      })
      .$render({}),
    "/user/kruschid/settings/group"
  );
  t.equal(
    routesWithOptionalParams.user.setting.group
      .$from("/user/root/settings/queue/group", {
        path: {},
      })
      .$render({}),
    "/user/root/settings/queue/group"
  );
  t.equal(
    routesWithOptionalParams.user._.setting.group
      .$from("settings/queue/admins/group", {
        path: {},
      })
      .$render({}),
    "settings/queue/admins/group"
  );
  t.equal(
    routesWithOptionalParams.user._.setting.group
      .$from("settings/queue/admins/group", {
        path: { gid: "clients", sid: "leads" },
      })
      .$render({}),
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
          path: ["category", str.optional("cid")],
          query: [str.optional("search")],
          children: {
            date: {
              path: ["date", date("date")],
              query: [int.optional("page")],
            },
          },
        },
      },
    },
  });

  t.equal(
    routes.blog.category.$replace(
      "/blog/en/category/movies/date/2012-12-28?search=batman&page=1",
      { path: { cid: "art" }, query: {} }
    ),
    "/blog/en/category/art/date/2012-12-28?search=batman&page=1",
    "should replace path params in absolute path"
  );

  t.equal(
    routes.blog._.category.date.$replace(
      "category/movies/date/2012-12-28?search=batman&page=1",
      { path: { cid: "art" }, query: {} }
    ),
    "category/art/date/2012-12-28?search=batman&page=1",
    "should replace params in relative path"
  );

  t.equal(
    routes.blog.$replace("/blog/en?additionalParam=value", {
      path: { lang: "es" },
    }),
    "/blog/es?additionalParam=value",
    "should keep additional params"
  );

  t.equal(
    routes.blog._.category.$replace(
      "category/movies/date/2012-12-28?search=batman&page=1",
      { path: { cid: "art" }, query: { search: undefined } }
    ),
    "category/art/date/2012-12-28?page=1",
    "should remove param"
  );

  t.throws(
    () =>
      routes.blog._.category.date.$replace("category/movies/date/2012-12-28", {
        path: { date: undefined },
        query: {},
      }),
    "throws when deleting a required parameter"
  );

  t.comment("todo: should replace query params in absolute path");
  t.comment("todo: should replace query params in relative path");
  t.comment("todo: should replace path & query params in absolute path");
  t.comment("todo: should replace path & query params in relative path");
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
  const renderPath = ({
    pathSegments,
    isRelative,
    pathParams,
    queryParams,
  }: AnyRenderContext) => {
    // path params
    const path = pathSegments.flatMap((pathSegment) =>
      typeof pathSegment === "string"
        ? pathSegment
        : pathParams[pathSegment.name] != null
        ? pathParams[pathSegment.name]
        : []
    );

    const searchParams = new URLSearchParams(queryParams).toString();

    const pathname = (isRelative ? "" : "/") + path.join("/");
    const search = (searchParams ? `?` : "") + searchParams;
    const href = pathname + search;

    return { pathname, search, href };
  };

  const routes = createRoutes(
    {
      home: {},
      blog: {
        path: ["blog", str("lang")],
        children: {
          category: {
            path: ["category", str.optional("cid")],
            query: [str.optional("search")],
          },
        },
      },
    },
    { ...defaultContext, renderPath }
  );

  t.deepEqual(
    routes.blog.category.$render({
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

test("render global query params", (t) => {
  const routes = createRoutes({
    root: {
      query: [str.optional("search")],
      children: {
        blog: {
          path: ["blog", str("lang")],
        },
      },
    },
  });

  t.equal(
    routes.root.$render({ query: { search: "hello" } }),
    "/?search=hello"
  );

  t.equal(
    routes.root.$bind({ query: { search: "hello" } })._.$render({}),
    "?search=hello"
  );

  t.equal(
    routes.root.blog.$render({
      query: { search: "hello" },
      path: { lang: "de" },
    }),
    "/blog/de?search=hello"
  );

  t.equal(
    routes.root.$bind({ query: { search: "hello" } })._.blog.$render({
      path: { lang: "de" },
    }),
    "blog/de?search=hello"
  );

  t.end();
});

test("route composition", (t) => {
  const usersRoutes = createRoutes({
    list: {
      path: ["list"],
    },
    detail: {
      path: ["detail", int("uid")],
    },
  });

  const cartRoutes = createRoutes({
    detail: {
      path: ["detail"],
    },
  });

  const globalRoutes = createRoutes({
    home: {
      path: ["home"],
    },
  });

  const routes = createRoutes({
    ...globalRoutes.$routes,
    user: {
      path: ["user"],
      children: usersRoutes.$routes,
    },
    cart: {
      path: ["cart"],
      children: cartRoutes.$routes,
    },
  });

  t.equals(routes.home.$render({}), "/home");
  t.equals(routes.user.list.$render({}), "/user/list");
  t.equals(
    routes.user.detail.$render({ path: { uid: 123 } }),
    "/user/detail/123"
  );
  t.equals(routes.cart.detail.$render({}), "/cart/detail");

  t.end();
});
