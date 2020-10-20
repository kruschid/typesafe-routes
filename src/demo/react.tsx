import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, useRouteMatch } from "react-router-dom";
import { floatParser, route, stringParser } from "..";
import { Link, useRouteParams } from "../react-router";

const homeRoute = route("/", {}, {});

const aboutRoute = route("/about", {}, {});

const topicRoute = route("/:topicId&:limit?", { topicId: stringParser, limit: floatParser }, {});

const topicsRoute = route("/topics", {}, { topicRoute });

const App = () =>
  <BrowserRouter>
    <div>
      <ul>
        <li>
          <Link to={homeRoute({})}>Home</Link>
        </li>
        <li>
          <Link to={aboutRoute({})}>About</Link>
        </li>
        <li>
          <Link to={topicsRoute({})}>Topics</Link>
        </li>
      </ul>
      <Switch>
        <Route path={aboutRoute.template}>
          <About />
        </Route>
        <Route path={topicsRoute.template}>
          <Topics />
        </Route>
        <Route path={homeRoute.template}>
          <Home />
        </Route>
      </Switch>
    </div>
  </BrowserRouter>;

const Home = () =>
  <h2>Home</h2>;

const About = () =>
  <h2>About</h2>;

const Topics = () => {
  let match = useRouteMatch();

  return (
    <div>
      <h2>Topics</h2>

      <ul>
        <li>
          <Link to={topicsRoute({}).topicRoute({topicId: "components"})}>
            Components
          </Link>
        </li>
        <li>
          <Link to={topicsRoute({}).topicRoute({topicId: "props-v-state", limit: 668.5})}>
            Props v. State
          </Link>
        </li>
      </ul>

      <Switch>
        <Route path={match.path + topicRoute.template}>
          <Topic />
        </Route>
        <Route path={match.path}>
          <h3>Please select a topic.</h3>
        </Route>
      </Switch>
    </div>
  );
}

function Topic() {
  let { topicId, limit } = useRouteParams(topicRoute);
  return (
    <h3>
      Requested topic ID: {topicId}, limit:&nbsp;
      {limit != null && limit === limit ? (
        limit * 2
      ) : (
        "unknown"
      )}
    </h3>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));
