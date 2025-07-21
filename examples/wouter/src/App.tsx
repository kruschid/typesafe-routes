import { Link, Redirect, Route, Switch } from "wouter"
import { render, renderPath, template } from "typesafe-routes";
import { routes } from "./routes";
import { Dashboard } from "./pages/Dashboard";
import { Orgs } from "./pages/Orgs";
import { Locations } from "./pages/Locations";

export const App = () =>
  <>
    <ul>
      <li><Link to={renderPath(routes.dashboard, {})}>Dashboard</Link></li>
      <li><Link to={renderPath(routes.orgs, { orgId: 123 })}>Org</Link></li>
      <li>
        <Link
          to={render(routes.orgs.locations, {
            path: { orgId: 321, locationId: 12 },
            query: { page: 12 }
          })}
        >
          Location
        </Link>
      </li>
    </ul >
    <Switch>
      <Route path={template(routes.dashboard)}>
        <Dashboard />
      </Route>
      <Route path={template(routes.orgs)} nest>
        <Orgs />
        <Route path={template(routes.orgs._.locations)}>
          <Locations />
        </Route>
      </Route>
      <Route>
        <Redirect
          replace
          to={renderPath(routes.dashboard, {})}
        />
      </Route>
    </Switch>
  </>;
