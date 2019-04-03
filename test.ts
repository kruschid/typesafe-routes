import * as test from "tape";
import { routeBuilder } from ".";

export interface IRoute {
  dashboard: {
    settings: {}
    apps: {
      [appId: string]: {
        users: {
          [userId: string] : {
            settings: {}
          }
        }
      }
    }
  }
}

const baseUrl = "https://localhost:8080";
const appId = 5;
const userId = "5ab8f42e618b623ca0f25533";

test("#routeBuilder should build absolute routes", (t) => {
  t.plan(2);

  const route = routeBuilder<IRoute>(baseUrl);
  const appRoute = route("dashboard")("apps")(appId);

  t.equal(
    appRoute(),
    "https://localhost:8080/dashboard/apps/5",
    "should render app route",
  );

  const userSettingsRoute = appRoute("users")(userId)("settings");

  t.equal(
    userSettingsRoute(),
    "https://localhost:8080/dashboard/apps/5/users/5ab8f42e618b623ca0f25533/settings",
    "should render userSettingsRoute",
  );
});

test("#routeBuilder should build relative routes", (t) => {
  t.plan(1);
  type IAppsRoute = IRoute["dashboard"]["apps"][""];
  const appsRoute  = routeBuilder<IAppsRoute>();
  const relativeRoute  = appsRoute("users")(userId)("settings");

  t.equal(
    relativeRoute(),
    "users/5ab8f42e618b623ca0f25533/settings",
    "should render relative route",
  );
});
