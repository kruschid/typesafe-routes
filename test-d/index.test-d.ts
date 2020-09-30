import { Test, A } from "ts-toolbelt";
import { expectError, expectType } from "tsd";
import { booleanParser, ExtractParserReturnTypes, InferParamGroups, intParser, MergeParamGroups, OptionalParamNames, RequiredParamNames, route, RouteNode, stringParser } from "../build";

const {checks, check} = Test;

// only required params
checks([
  check<
    InferParamGroups<"a/:one/b/:two&:three">,
    ["one" | "two" | "three", never],
    Test.Pass
  >(),
  check<
    RequiredParamNames<InferParamGroups<"a/:one/b/:two&:three">>,
    "one" | "two" | "three",
    Test.Pass
  >()
]);

// only optional params
checks([
  check<
    InferParamGroups<":one?/b/:two?&:three?">,
    [never, "one" | "two" | "three"],
    Test.Pass
  >(),
  check<
    OptionalParamNames<InferParamGroups<":one?/b/:two?&:three?">>,
    "one" | "two" | "three",
    Test.Pass
  >()
]);

// mixed params
checks([
  check<
    InferParamGroups<"/:one?/b/:two&:three?">,
    ["two", "one" | "three"],
    Test.Pass
  >(),
  check<
    MergeParamGroups<InferParamGroups<"/:one?/b/:two&:three?">>,
    "two"| "one" | "three",
    Test.Pass
  >()
]);

// extract param types from parser map
checks([
  check<
    ExtractParserReturnTypes<{a: typeof intParser, b: typeof stringParser}, "a">,
    { a: number },
    Test.Pass
  >(),
]);

//
//
// simple routes and parsers
expectType<RouteNode<"", {}, {}>>(
  route("", {}, {})
);
expectType<RouteNode<"/test", {}, {}>>(
  route("/test", {}, {})
);
expectType<RouteNode<"/test", {}, {}>>(
  route("/test", {}, {})
);
expectType<RouteNode<"/:test", { test: typeof intParser}, {}>>(
  route("/:test", { test: intParser }, {})
);
expectError(route("/:test", {}, {}));
expectError(route("/:test", { _test: intParser }, {}));

//
//
// with params
const accountRoute = route("account", {}, {});
const settingsRoute = route("settings/:settingsId", { settingsId: stringParser }, { accountRoute })

expectType(accountRoute({}));
expectType(settingsRoute({ settingsId: "abs" }));
expectType<string>(
  settingsRoute({ settingsId: "abs" }).$
);
expectType<typeof accountRoute>(
  settingsRoute({ settingsId: "abs" }).accountRoute
);
expectType<string>(
  settingsRoute({ settingsId: "abs" }).accountRoute({}).$
);
expectType<string>(
  settingsRoute.template
);
expectError(settingsRoute({ settingsId: 123 }));
expectError(settingsRoute({}));
expectError(settingsRoute({ settingsId: "defgh"}).something);

//
//
// nested routes

const groupRoute = route("group/:groupId?&:filter?&:limit", { 
  groupId: stringParser,
  filter: booleanParser,
  limit: intParser,
}, {
  settingsRoute,
});

expectType(groupRoute({limit: 1}));
expectType<typeof settingsRoute>(
  groupRoute({limit: 1}).settingsRoute
);
expectType<string>(
  groupRoute({limit: 1}).settingsRoute({settingsId: ""}).$
);
expectType<string>(
  groupRoute({limit: 1, groupId: "", filter: true}).settingsRoute({settingsId: ""}).$
);
expectType<typeof accountRoute>(
  groupRoute({limit: 1}).settingsRoute({settingsId: ""}).accountRoute
);
expectType<string>(
  groupRoute({limit: 1}).settingsRoute({settingsId: ""}).accountRoute({}).$
);
expectError(groupRoute({limit: 1, groupId: "", filter: true, extra: 1}));
expectError(groupRoute({limit: 1, groupIddd: "", filter: true}));

checks([
  check<
    A.Compute<Parameters<typeof groupRoute>>,
    [{filter?: boolean, groupId?: string, limit: number}],
    Test.Pass
  >(),
]);

//
//
// param parsing

checks([
  check<
    A.Compute<ReturnType<typeof groupRoute.parseParams>>,
    {filter?: boolean, groupId?: string, limit: number},
    Test.Pass
  >(),
]);

expectError(groupRoute.parseParams());
expectError(groupRoute.parseParams({}));
expectError(groupRoute.parseParams({limit: 1}));
expectError(groupRoute.parseParams({limit: "1", filter: 5}));
expectError(groupRoute.parseParams({limit: "1", extra: "423"}));
expectType<{ limit: number }>(
  groupRoute.parseParams({limit: "1"})
);
