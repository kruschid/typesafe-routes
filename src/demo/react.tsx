import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Link, Route, Switch, useParams, useRouteMatch } from "react-router-dom";
import { route, stringParser } from "..";

type TopicParams = Parameters<typeof topicRoute.parseParams>[0];

const homeRoute = route("/", {}, {});

const aboutRoute = route("/about", {}, {});

const topicRoute = route("/:topicId", { topicId: stringParser }, {});

const topicsRoute = route("/topics", {}, { topicRoute });

const App = () =>
  <BrowserRouter>
    <div>
      <ul>
        <li>
          <Link to={homeRoute({}).$}>Home</Link>
        </li>
        <li>
          <Link to={aboutRoute({}).$}>About</Link>
        </li>
        <li>
          <Link to={topicsRoute({}).$}>Topics</Link>
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
          <Link to={topicsRoute({}).topicRoute({topicId: "components"}).$}>
            Components
          </Link>
        </li>
        <li>
          <Link to={topicsRoute({}).topicRoute({topicId: "props-v-state"}).$}>
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
  let { topicId } = topicRoute.parseParams(useParams<TopicParams>());
  return <h3>Requested topic ID: {topicId}</h3>;
}

ReactDOM.render(<App />, document.getElementById("app"));
