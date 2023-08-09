import test from "tape";
import { booleanParser, dateParser, intParser, recursiveRoute, route, stringParser } from ".";

test("commonjs imports in strict mode", (t) => {
  // https://github.com/kruschid/typesafe-routes/issues/3
  t.plan(2);

  const { route: routeCJS } = require(".");
  t.equal(
    routeCJS("/root", {}, {})({}).$,
    "/root",
  );
  t.equal(
    require(".").route("/root", {}, {})({}).$,
    "/root"
  );
});

test("absolute & relative routes", (t) => {
  t.plan(5);

  const rootRoute = route("/", {}, {});
  t.equal(rootRoute({}).$, "/");

  const absRoute = route("/abs", {}, {});
  t.equal(absRoute({}).$, "/abs");

  const absRouteWithChild = route("/parent", {}, { child: absRoute });
  t.equal(
    absRouteWithChild({}).child({}).$,
    "/parent/abs"
  );

  const relRoute = route("child", {}, {});
  t.equal(relRoute({}).$, "child");

  const relRouteWithChild = route("parent", {}, { child: relRoute });
  t.equal(
    relRouteWithChild({}).child({}).$,
    "parent/child"
  );
});

test("nested routes", (t) => {
  t.plan(3);

  const accountRoute = route("account", {}, {});
  const settingsRoute = route("settings/:settingsId", { settingsId: stringParser }, { accountRoute })
  const groupRoute = route("/group/:groupId?&:filter?&:limit", {
    groupId: stringParser,
    filter: booleanParser,
    limit: intParser,
  }, {
    settingsRoute,
  });

  t.equal(
    groupRoute({ filter: true, limit: 20, groupId: "groupId" })
      .settingsRoute({ settingsId: "settingsId" })
      .accountRoute({}).$,
    "/group/groupId/settings/settingsId/account?filter=true&limit=20",
    "should match nested route"
  );
  t.equal(
    groupRoute({ limit: 30 })
      .settingsRoute({ settingsId: "settingsId" })
      .accountRoute({}).$,
    "/group/settings/settingsId/account?limit=30",
    "should respect optional params"
  );

  const rootRoute = route("/", {}, { account: accountRoute });
  t.equal(rootRoute({}).account({}).$, "/account");
});

test("recursive routes", (t) => {
  t.plan(1);

  const nodeRoute = recursiveRoute("/node/:nodeId", { nodeId: intParser }, {});

  t.equal(
    nodeRoute({ nodeId: 1 }).$self({ nodeId: 2 }).$self({ nodeId: 3 }).$self({ nodeId: 4 }).$,
    "/node/1/node/2/node/3/node/4",
    "should match recursive route",
  )
});

test("param parser", (t) => {
  t.plan(4);

  const groupRoute = route("group/:groupId?&:filter?&:limit&:date?", {
    groupId: stringParser,
    filter: booleanParser,
    limit: intParser,
    date: dateParser,
  }, {});

  t.deepEqual(
    groupRoute.parseParams({ limit: "99", filter: "true", groupId: "abc", date: "2020-10-02T10:29:50Z" }),
    { limit: 99, filter: true, groupId: "abc", date: new Date("2020-10-02T10:29:50Z") },
    "should parse params",
  );

  t.deepEqual(
    groupRoute.parseParams({ limit: "9" }),
    { limit: 9 },
    "should skip optional params",
  );

  t.deepEqual(
    groupRoute.parseParams({ limit: "9", extra: 1 } as any),
    { limit: 9 },
    "should not throw if additional params were provided",
  );

  t.throws(
    () => groupRoute.parseParams({} as any, true),
    "should throw error in strict mode",
  );
});

test("template", (t) => {
  t.plan(1);

  const settingsRoute = route("settings/:settingsId", { settingsId: stringParser }, {})
  const groupRoute = route("group/:groupId?&:filter?&:limit", {
    groupId: stringParser,
    filter: booleanParser,
    limit: intParser,
  }, {
    settingsRoute,
  });

  t.deepEqual(
    [settingsRoute.template, groupRoute.template],
    ["settings/:settingsId", "group/:groupId?"],
    "should match templates"
  );

  // const [settingsRoute, settingsTemplate] = route("settings/:settingsId", {} , {...children});
  // settingsTemplate.childA.childB.$
});

test("serializer", (t) => {
  t.plan(1);

  const groupRoute = route("group/:groupId?&:limit", {
    groupId: stringParser,
    limit: intParser,
  }, {});

  t.equal(
    groupRoute({ groupId: "abc", limit: 0 }).$,
    "group/abc?limit=0",
    "should serialize 0"
  );
});
