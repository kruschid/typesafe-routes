import * as test from "tape";
import { Ruth, QueryParams } from ".";

test("empty route", (t) => {
  interface IRoute {
    "": {}
  }

  t.plan(3);

  t.equal(
    Ruth<IRoute>()("").str(),
    "/",
    "should build empty route without prefix",
  );
  
  t.equal(
    Ruth<IRoute>("#")("").str(),
    "#/",
    "should build empty route with hash prefix",
  );

  const baseUrl = "https://localhost:8080";
  t.equal(
    Ruth<IRoute>(baseUrl)("").str(),
    "https://localhost:8080/",
    "should build empty route with baseUrl prefix",
  );
});

test("absolute routes", (t) => {
  interface IRoute {
    dashboard: {
      apps: {
        all: {}
      }
    }
  }

  t.plan(1);

  const baseUrl = "https://localhost:8080";
  const r = Ruth<IRoute>(baseUrl);

  t.equal(
    r("dashboard")("apps")("all").str(),
    "https://localhost:8080/dashboard/apps/all",
    "should match full route",
  );
});

test("relative routes", (t) => {
  interface IRoute {
    dashboard: {
      apps: {
        all: {}
        games: {}
        office: {}
      }
    }
  }

  t.plan(1);

  const baseUrl = "https://localhost:8080";
  const r = Ruth<IRoute>(baseUrl);
  const dashboard = r("dashboard");
  const apps = dashboard("apps");
  const allApps = apps("all");
  const games = apps("games");
  const office = apps("office");

  t.deepEqual([
    dashboard.str(),
    apps.str(),
    allApps.str(),
    games.str(),
    office.str(),
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

  interface IRoute {
    users: {
      show(userId: string): {
        delete: {}
      }
      list(...p:
        | [{category: Category}, {limit: number}]
        | [{registrationDate: ISODate}]
      ): {}
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

  const r = Ruth<IRoute>();

  t.deepEqual([
    r("users")("show", userId)("delete").str(),
    r("users")("list", {category}, {limit: 30}).str(),
    r("users")("list", {registrationDate}).str(),
  ], [
    "/users/show/5ab8f42e618b623ca0f25533/delete",
    "/users/list/active/30",
    "/users/list/2017-01-01",
  ],
    "should match parameterized routes",
  );
});
