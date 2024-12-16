import test from "tape";
import {
  bool,
  createRoutes,
  date,
  float,
  int,
  isoDate,
  list,
  oneOf,
  parsePath,
  parseQuery,
  render,
  renderPath,
  renderQuery,
  safeParsePath,
  safeParseQuery,
  str,
  template,
} from "../src";

test("template", (t) => {
  const routes = createRoutes({
    home: {},
    blog: {
      path: ["blog", str("lang")],
      children: {
        $wildcard: { template: "**" },
        category: {
          path: ["category", str("cid")],
          children: {
            $wildcard: { template: "**" },
            date: {
              path: [isoDate("date")],
            },
          },
        },
      },
    },
  });

  t.equal(template(routes.home), "/");
  t.equal(template(routes.blog), "/blog/:lang");
  t.equal(template(routes.blog.$wildcard), "/blog/:lang/**");
  t.equal(
    template(routes.blog.category.date),
    "/blog/:lang/category/:cid/:date"
  );
  t.equal(
    template(routes.blog.category.$wildcard),
    "/blog/:lang/category/:cid/**"
  );
  t.equal(template(routes.blog._.category.$wildcard), "category/:cid/**");
  t.equal(template(routes.blog._.category.date), "category/:cid/:date");
  t.equal(template(routes.blog.category._.date), ":date");

  t.end();
});

test("custom templates ", (t) => {
  const routes = createRoutes({
    customTemplate: {
      template: "segment/:param/segment",
    },
    customParamTemplate: {
      path: ["segment", str("title", { template: ":title.(mp4|mov)" })],
    },
  });

  t.equal(template(routes.customTemplate), "/segment/:param/segment");
  t.equal(template(routes.customParamTemplate), "/segment/:title.(mp4|mov)");

  t.end();
});

test("renderPath", (t) => {
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

  t.equal(renderPath(routes, {}), "/", "renders home route on empty context");
  t.equal(renderPath(routes.home, {}), "/");
  t.equal(renderPath(routes.blog, { lang: "en" }), "/blog/en");
  t.equal(
    renderPath(routes.blog.category, { lang: "en", cid: "movies" }),
    "/blog/en/category/movies"
  );
  t.end();
});

test("renderQuery ", (t) => {
  const routes = createRoutes({
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

  t.equal(renderQuery(routes, {}), "");
  t.equal(renderQuery(routes.blog, {}), "");
  t.equal(renderQuery(routes.blog.category, {}), "");
  t.equal(
    renderQuery(routes.blog.category, { search: "robocop" }),
    "search=robocop"
  );
  t.equal(renderQuery(routes.blog.category.date, { page: 1 }), "page=1");
  t.equal(
    renderQuery(routes.blog.category.date, { search: "robocop", page: 1 }),
    "search=robocop&page=1"
  );
  t.equal(renderQuery(routes.blog.category._.date, { page: 2 }), "page=2");
  t.equal(
    // @ts-expect-error
    renderQuery(routes.blog.category._.date, { search: "robocop", page: 1 }),
    "page=1"
  );
  t.end();
});

test("render", (t) => {
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

  t.equal(render(routes, { path: {}, query: {} }), "/");
  t.equal(render(routes.home, { path: {}, query: {} }), "/");
  t.equal(render(routes.blog, { path: { lang: "en" }, query: {} }), "/blog/en");
  t.equal(
    render(routes.blog.category, {
      path: { lang: "en", cid: "movies" },
      query: {},
    }),
    "/blog/en/category/movies"
  );
  t.equal(
    render(routes.blog.category, {
      path: { lang: "en", cid: "movies" },
      query: { search: "robocop" },
    }),
    "/blog/en/category/movies?search=robocop"
  );
  t.equal(
    render(routes.blog.category.date, {
      path: { lang: "en", cid: "movies", date: new Date(1703798091000) },
      query: { search: "robocop", page: 42 },
    }),
    "/blog/en/category/movies/2023-12-28?search=robocop&page=42"
  );
  t.equal(
    render(routes.blog.category.date, {
      path: { lang: "en", cid: "movies", date: new Date(1703798091000) },
      query: { search: "robocop", page: 0 },
    }),
    "/blog/en/category/movies/2023-12-28?search=robocop&page=0",
    "falsy parameters should be rendered"
  );
  t.equal(
    render(routes.blog._.category.date, {
      path: { cid: "movies", date: new Date(1703798091000) },
      query: { search: "robocop", page: 42 },
    }),
    "category/movies/2023-12-28?search=robocop&page=42"
  );
  t.equal(
    render(routes.blog._.category.date, {
      path: { cid: "movies", date: new Date(1703798091000) },
      query: { page: 42 },
    }),
    "category/movies/2023-12-28?page=42"
  );

  t.end();
});

test("parsePath", (t) => {
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
    parsePath(routes.blog.category.date, {
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
    parsePath(
      routes.blog.category.date,
      "blog/false/category/24/date/2024-11-29"
    ),
    {
      lang: false,
      cid: 24,
      date: new Date("2024-11-29T00:00:00.000Z"),
    }
  );

  t.deepEqual(
    parsePath(routes.blog.category.date, {
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
    parsePath(
      routes.blog.category.date,
      "blog/true/category/0/date/2024-11-29"
    ),
    {
      lang: true,
      cid: 0,
      date: new Date("2024-11-29T00:00:00.000Z"),
    }
  );

  t.deepEqual(
    parsePath(routes.blog._.category.date, {
      cid: "42",
    }),
    { cid: 42 },
    "relative path with optional params"
  );

  t.deepEqual(
    parsePath(routes.blog._.category.date, "category/42/date"),
    {
      cid: 42,
    },
    "relative path with omitted optional params in string path"
  );

  t.deepEqual(
    parsePath(routes.blog._.category.date, "category/244/date/2024-10-29"),
    {
      cid: 244,
      date: new Date("2024-10-29T00:00:00.000Z"),
    },
    "relative path with all optional params in string path"
  );

  t.throws(
    () =>
      parsePath(routes.blog.category._.date, "category/244/date/2024-10-29"),
    "string path mismatch"
  );

  t.deepEqual(
    safeParsePath(
      routes.blog.category.date,
      "blog/true/category/0/date/2024-11-29"
    ),
    {
      success: true,
      data: {
        lang: true,
        cid: 0,
        date: new Date("2024-11-29T00:00:00.000Z"),
      },
    }
  );
  t.deepEqual(
    safeParsePath(routes.blog.category._.date, "category/244/date/2024-10-29"),
    {
      success: false,
      error: Error(
        `"category/244/date/2024-10-29" doesn't match "date/:date?", missing segment "date"`
      ),
    },
    "safeCall failed"
  );

  t.end();
});

test("parseQuery", (t) => {
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
    parseQuery(routes.blog.category.date, {
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
    parseQuery(
      routes.blog.category.date,
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
    parseQuery(routes.blog._.category.date, {
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
    parseQuery(
      routes.blog._.category.date,
      "category=drama&shortmovie=true&month=feb"
    ),
    {
      category: "drama",
      shortmovie: true,
      month: "feb",
    }
  );
  t.throws(() => parseQuery(routes.blog.category._.date, {}));
  t.throws(() => parseQuery(routes.blog.category._.date, { month: "jun" }));
  t.throws(() => parseQuery(routes.blog._.category.date, "lang=en&category"));
  t.deepEqual(
    safeParseQuery(
      routes.blog.category.date,
      "lang=en&category=drama&shortmovie=true&month=feb"
    ),
    {
      success: true,
      data: {
        lang: "en",
        category: "drama",
        shortmovie: true,
        month: "feb",
      },
    }
  );
  t.deepEqual(
    safeParseQuery(routes.blog._.category.date, {
      lang: "en", // ignores additional params
      category: "drama",
      shortmovie: "true",
      month: "feb",
    }),
    {
      success: true,
      data: {
        category: "drama",
        shortmovie: true,
        month: "feb",
      },
    }
  );
  t.deepEqual(
    safeParseQuery(routes.blog.category.date, ""),
    {
      success: false,
      error: Error(
        'parseQuery: required query parameter "lang" was not provided in "/blog/movies/2023"'
      ),
    },
    "safeCall failed"
  );
  t.end();
});

// test("replace", (t) => {
//   const routes = createRoutes({
//     home: {},
//     blog: {
//       path: ["blog", str("lang")],
//       children: {
//         category: {
//           path: ["category", str.optional("cid")],
//           query: [str.optional("search")],
//           children: {
//             date: {
//               path: ["date", date("date")],
//               query: [int.optional("page")],
//             },
//           },
//         },
//       },
//     },
//   });

//   t.equal(
//     routes.blog.category.$replace(
//       "/blog/en/category/movies/date/2012-12-28?search=batman&page=1",
//       { path: { cid: "art" }, query: {} }
//     ),
//     "/blog/en/category/art/date/2012-12-28?search=batman&page=1",
//     "should replace path params in absolute path"
//   );

//   t.equal(
//     routes.blog._.category.date.$replace(
//       "category/movies/date/2012-12-28?search=batman&page=1",
//       { path: { cid: "art" }, query: {} }
//     ),
//     "category/art/date/2012-12-28?search=batman&page=1",
//     "should replace params in relative path"
//   );

//   t.equal(
//     routes.blog.$replace("/blog/en?additionalParam=value", {
//       path: { lang: "es" },
//     }),
//     "/blog/es?additionalParam=value",
//     "should keep additional params"
//   );

//   t.equal(
//     routes.blog._.category.$replace(
//       "category/movies/date/2012-12-28?search=batman&page=1",
//       { path: { cid: "art" }, query: { search: undefined } }
//     ),
//     "category/art/date/2012-12-28?page=1",
//     "should remove param"
//   );

//   t.throws(
//     () =>
//       routes.blog._.category.date.$replace("category/movies/date/2012-12-28", {
//         path: { date: undefined },
//         query: {},
//       }),
//     "throws when deleting a required parameter"
//   );

//   t.comment("todo: should replace query params in absolute path");
//   t.comment("todo: should replace query params in relative path");
//   t.comment("todo: should replace path & query params in absolute path");
//   t.comment("todo: should replace path & query params in relative path");
//   t.end();
// });

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
    ...globalRoutes["~routes"],
    user: {
      path: ["user"],
      children: usersRoutes["~routes"],
    },
    cart: {
      path: ["cart"],
      children: cartRoutes["~routes"],
    },
  });

  t.equals(renderPath(routes.home, {}), "/home");
  t.equals(renderPath(routes.user.list, {}), "/user/list");
  t.equals(renderPath(routes.user.detail, { uid: 123 }), "/user/detail/123");
  t.equals(renderPath(routes.cart.detail, {}), "/cart/detail");

  t.end();
});

// test("angular routes", (t) => {
//   const createRoute: CreateAngularRoutes<{ component: string }> =
//     createAngularRoutes;

//   const r = createRoute({
//     a: {
//       path: ["string", int("parm")],
//       meta: { component: "A" },
//       children: {
//         b: {
//           meta: { component: "B" },
//         },
//       },
//     },
//     c: {
//       path: ["string", int("lala")],
//     },
//   });

//   t.deepEquals(r.$routes.a.meta, { component: "A" });
//   t.deepEquals(r.$provider, [
//     {
//       path: "string/:parm",
//       component: "A",
//       children: [
//         {
//           path: "string/:parm",
//           children: undefined,
//           component: "B",
//         },
//       ],
//     },
//     {
//       path: "string/:lala",
//       children: undefined,
//     },
//   ]);
//   t.end();
// });
