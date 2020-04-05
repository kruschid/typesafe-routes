import test from "tape";
import { R, queryParams, Route, QueryParams } from ".";

test("base url page", (t) => {
  t.plan(3);

  interface MyRoute {
    name: "home"
    params: []
  }

  t.equal(
    R<MyRoute>().home().$,
    "/home",
    "should build empty route without prefix",
  );
  
  t.equal(
    R("#").home().$,
    "#/home",
    "should build empty route with hash prefix",
  );

  const baseUrl = "https://localhost:8080";
  t.equal(
    R(baseUrl).home().$,
    "https://localhost:8080/home",
    "should build empty route with baseUrl prefix",
  );
});

test("nested routes", (t) => {
  interface DashboardRoute extends Route {
    name: "dashboard"
    params: []
    children: {
      name: "apps"
      params: []
      children:
        | { name: "all", params: [] }
        | { name: "games", params: [] } 
        | { name: "office", params: [] }
    }
  }

  t.plan(1);

  const baseUrl = "https://localhost:8080";
  const r = R<DashboardRoute>(baseUrl);
  const dashboard = r.dashboard();
  const apps = dashboard.apps();
  const allApps = apps.all();
  const games = apps.games();
  const office = apps.office();

  t.deepEqual([
    dashboard.$,
    apps.$,
    allApps.$,
    games.$,
    office.$,
  ], [
    "https://localhost:8080/dashboard",
    "https://localhost:8080/dashboard/apps",
    "https://localhost:8080/dashboard/apps/all",
    "https://localhost:8080/dashboard/apps/games",
    "https://localhost:8080/dashboard/apps/office",
  ], "should match relative routes");
});

test("parameterized routes", (t) => {
  type Category = "all" | "active" | "inactive";

  class ISODate {
    constructor(
      private year: number,
      private month: number,
      private date: number,
    ){ }
  
    toString() {
      return [
        String(this.year).padStart(4, "0"),
        String(this.month).padStart(2, "0"),
        String(this.date).padStart(2, "0"),
      ].join("-");
    }
  }

  interface UsersRoute extends Route  {
    name: "users"
    params: []
    children:
      | ShowUserRoute
      | ListUsersRoute
  }

  interface ShowUserRoute extends Route {
    name: "show"
    params: [{userId: string}]
    children:
      | {name: "delete", params: []}
  }

  interface ListUsersRoute extends Route  {
    name: "list"
    params:
      | [{category: Category}, {limit: number}]
      | [{registrationDate: ISODate}]
  }

  t.plan(1);

  const userId = "5ab8f42e618b623ca0f25533";
  const category: Category = "active";
  const registrationDate = new ISODate(2017, 1, 1);

  const r = R<UsersRoute>("");

  t.deepEqual([
    r.users().show({ userId }).delete().$,
    r.users().list({ category }, {limit: 30}).$,
    r.users().list({ registrationDate }).$,
  ], [
    "/users/show/5ab8f42e618b623ca0f25533/delete",
    "/users/list/active/30",
    "/users/list/2017-01-01",
  ],
    "should match parameterized routes",
  );
});

test("query paramters", (t) => {
  
  interface UsersRoute {
    name: "users"
    params: [{groupId: number}, QueryParams<{page: number}>]
    children: UserSearchRoute
  }

  interface UserSearchRoute {
    name: "search"
    params: [QueryParams<{name: string, limit: number}>]
  }

  t.plan(1);

  const r = R<UsersRoute>();

  t.deepEqual([
    r.users({groupId: 5}, queryParams({page: 1}))
      .search(queryParams({name: "Ruth", limit: 10})).$,
    r.users({groupId: 8}, queryParams({page: 3})).$,
  ], [
    "/users/5/search?page=1&name=Ruth&limit=10",
    "/users/8?page=3",
  ],
    "should match query string",
  );
});

test("custom query string renderer", (t) => {
  
  interface UsersRoute {
    name: "users"
    params: [{groupId: number}, QueryParams<{page: number}>]
    children: UserSearchRoute
  }

  interface UserSearchRoute {
    name: "search"
    params: [QueryParams<{name: string, limit: number}>]
  }

  t.plan(1);

  const stringify = (params: Record<string, any>) =>
    `?state=${Buffer.from(JSON.stringify(params)).toString("base64")}`;

  const r = R<UsersRoute>("", {}, stringify);

  t.deepEqual([
    r.users({groupId: 5}, queryParams({page: 1}))
      .search(queryParams({name: "Ruth", limit: 10})).$,
    r.users({groupId: 8}, queryParams({page: 3})).$,
  ], [
    '/users/5/search?state=eyJwYWdlIjoxLCJuYW1lIjoiUnV0aCIsImxpbWl0IjoxMH0=',
    '/users/8?state=eyJwYWdlIjozfQ==',
  ],
    "should match query string",
  );
});

test("param overloading", (t) => {
  type Category = "all" | "active" | "inactive";

  class ISODate {
    toString() {
      return "2017-01-01";
    }
  }

  interface UsersRoute extends Route  {
    name: "users"
    params: []
    children: ShowUserRoute | ListUsersRoute
  }

  interface ShowUserRoute extends Route {
    name: "show"
    params:
      | []
      | [{userId: string}]
      | [":userId?" | ":userId"]
    children:
      | {name: "delete", params: []}
  }

  interface ListUsersRoute extends Route  {
    name: "list"
    params:
      | [{category: Category}, {limit: number}]
      | [":category", ":limit"]
      | [{registrationDate: ISODate}]
      | [":registrationDate"]
  }

  t.plan(1);

  const r = R<UsersRoute>();

  t.deepEqual([
    r.users().show().$,
    r.users().show(":userId?").$,
    r.users().show().delete().$,
    r.users().show(":userId").delete().$,
    r.users().list(":category", ":limit").$,
    r.users().list(":registrationDate").$,
  ], [
    "/users/show",
    "/users/show/:userId?",
    "/users/show/delete",
    "/users/show/:userId/delete",
    "/users/list/:category/:limit",
    "/users/list/:registrationDate"
  ], "should match templates");
});
