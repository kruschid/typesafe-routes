import * as test from "tape";
import { R, QueryParams } from ".";

test("main page", (t) => {

  const routes = {
    "": {}
  }

  t.plan(3);

  t.equal(
    `${R(routes, "")[""]}`,
    "/",
    "should build empty route without prefix",
  );
  
  t.equal(
    `${R(routes, "#")[""]}`,
    "#/",
    "should build empty route with hash prefix",
  );

  const baseUrl = "https://localhost:8080";
  t.equal(
    `${R(routes, baseUrl)[""]}`,
    "https://localhost:8080/",
    "should build empty route with baseUrl prefix",
  );
});

test("with baseUrl", (t) => {
  const routes = {
    dashboard: {
      apps: {
        all: {}
      }
    }
  }

  t.plan(1);

  const baseUrl = "https://localhost:8080";
  const r = R(routes, baseUrl);

  t.equal(
    `${r.dashboard.apps.all}`,
    "https://localhost:8080/dashboard/apps/all",
    "should match full route",
  );
});

test("relative routes", (t) => {
  const routes = {
    dashboard: {
      apps: {
        all: {},
        games: {},
        office: {},
      }
    }
  }

  t.plan(1);

  const baseUrl = "https://localhost:8080";
  const r = R(routes, baseUrl);
  const dashboard = r.dashboard;
  const apps = dashboard.apps;
  const allApps = apps.all;
  const games = apps.games;
  const office = apps.office;

  t.deepEqual([
    `${dashboard}`,
    `${apps}`,
    `${allApps}`,
    `${games}`,
    `${office}`,
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

  const routes = {
    users: {
      show: (_: {userId: string}) => ({
        delete: {}
      }),
      list: (..._:
        | [{category: Category}, {limit: number}]
        | [{registrationDate: ISODate}]
      ) => {}
    }
  }

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

  t.plan(1);

  const userId = "5ab8f42e618b623ca0f25533";
  const category: Category = "active";
  const registrationDate = new ISODate(2017, 1, 1);

  const r = R(routes);

  t.deepEqual([
    `${r.users.show({userId}).delete}`,
    `${r.users.list({category}, {limit: 30})}`,
    `${r.users.list({registrationDate})}`,
  ], [
    "/users/show/5ab8f42e618b623ca0f25533/delete",
    "/users/list/active/30",
    "/users/list/2017-01-01",
  ],
    "should match parameterized routes",
  );
});

test("query paramters", (t) => {
  
  const routes = {
    users: {
      search: (
        _: QueryParams<{name: string, limit: number}>
      ) => ({})
    }
  }

  t.plan(1);

  const r = R(routes);

  t.equal(
    `${r.users.search(new QueryParams({name: "ruth", limit: 100}))}`,
    "/users/search?name=ruth&limit=100",
    "should match query string",
  );
});

test("templates", (t) => {
  type Category = "all" | "active" | "inactive";

  const routes = {
    users: {
      show: (..._:
        | []
        | [{userId: string}]
        | [":userId?" | ":userId"]
      ) => ({
        delete: {}
      }),
      list: (..._:
        | [{category: Category}, {limit: number}]
        | [":category", ":limit"]
        | [{registrationDate: ISODate}]
        | [":registrationDate"]
      ) => ({})
    }
  }

  class ISODate {
    toString() {
      return "2017-01-01";
    }
  }

  t.plan(1);

  const r = R(routes);

  t.deepEqual([
    `${r.users.show(":userId?")}`,
    `${r.users.show().delete}`,
    `${r.users.show(":userId").delete}`,
    `${r.users.list(":category", ":limit")}`,
    `${r.users.list(":registrationDate")}`,
  ], [
    "/users/show/:userId?",
    "/users/show/delete",
    "/users/show/:userId/delete",
    "/users/list/:category/:limit",
    "/users/list/:registrationDate"
  ], "should match templates");
});
