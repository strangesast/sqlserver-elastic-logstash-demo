import http from "http";

import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import { default as knexSetup } from "knex";
import config from "config";

const dbConfig = config.get("db") as any;
const knex = knexSetup({
  client: "mssql",
  connection: dbConfig,
});

const app = express();
const port = config.get("port");

app.use(bodyParser.json());
app.use(morgan("tiny"));

let i = 0;
app.post("/search", async (req, res) => {
  i++;
  let cancelled = false;
  let interval = setTimeout(() => {
    if (!cancelled) {
      res.json({ i });
    }
  }, 1000);
  req.on("close", () => {
    cancelled = true;
    clearInterval(interval);
  });
});

app.get("/people", async (req, res) => {
  let offset, limit;
  ({ offset, limit } = req.query);
  [offset, limit] = [offset, limit].map((n) => +(n as string));
  [offset, limit] = [offset || 0, limit || 10];

  const [results, { count: total }] = await Promise.all([
    knex.select("*").from("People").offset(offset).limit(limit),
    knex.from("People").count({ count: "*" }).first() as any,
  ]);

  res.json({ offset, limit, results, total });
});

app.post("/people", async (req, res) => {
  const { FirstName, LastName } = req.body;
  const result = await knex("People")
    .insert({ FirstName, LastName })
    .returning(["id", "FirstName", "LastName"]);

  res.json(result);
});

app.delete("/people", async (req, res) => {
  const { id } = req.body;
  const result = await knex("People").where({ id }).update({ Deleted: true });
  res.json(result);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = http.createServer(app);

server.listen(port, () => {
  console.log("Knex config", dbConfig);
  console.log(`Listening on port ${port}`);
});

process.on("SIGINT", () => {
  server.close(() => {
    process.exit();
  });
});
