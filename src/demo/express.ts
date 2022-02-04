import express from "express";
import { booleanParser, intParser, route, stringParser } from "..";

const homeRoute = route("/", {}, {});

const settingsRoute = route("/settings/:mode&:showAllOptions?", {
  mode: intParser,
  showAllOptions: booleanParser,
}, {});

const accountRoute = route("/account/:id", {
  id: stringParser,
}, { settingsRoute });

const mainView = (p?: {
  content: string;
}) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>typesafe-routes express demo</title>
  </head>
  <body>
    <h2>Accounts</h2>
    <ul>
      <li>
        <a href="${accountRoute({ id: "netflix" }).$}">Netflix</a>
      </li>
      <li>
        <a href="${accountRoute({ id: "zillow-group" }).$}">Zillow Group</a>
      </li>
      <li>
        <a href="${accountRoute({ id: "yahoo" }).$}">Yahoo</a>
      </li>
      <li>
        <a href="${accountRoute({ id: "modus-create" }).$}">Modus Create</a>
      </li>
    </ul>
    ${p?.content ?? ""}
  </body>
  </html>
`;

const accountView = (p: {
  id: string;
  content?: string;
}) => `
  <h3>${p.id}</h3>
  <a href="${accountRoute({ id: p.id })
    .settingsRoute({ mode: 1, showAllOptions: true })
    .$
  }">
    settings
  </a>
  ${p.content ?? ""}
`;

const settingsView = (p: {
  mode: number,
  showAllOptions?: boolean,
}) => `
  <h4>settings</h4>
  <p>mode: ${p.mode}</p>
  <p>showAllOptions: ${p.showAllOptions}</p>
`;

const app = express();
app.get(homeRoute.template, (_, res) => {
  res.send(mainView());
});

const accountRouter = express.Router({ mergeParams: true });
app.use(accountRoute.template, accountRouter);

accountRouter.get<any, any>(homeRoute.template, (req, res) => {
  const { id } = accountRoute.parseParams(req.params);
  res.send(
    mainView({ content: accountView({ id }) }),
  );
});

accountRouter.get<any, any>(settingsRoute.template, (req, res) => {
  const { id } = accountRoute.parseParams(req.params);
  const settingsParams = settingsRoute.parseParams({ ...req.params, ...req.query });
  res.send(
    mainView({
      content: accountView({
        id,
        content: settingsView(settingsParams),
      }),
    }),
  );
});

app.listen(3000, () => console.log("server is listening to port 3000"));
