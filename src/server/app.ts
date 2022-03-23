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
  const result = await knex.select("*").from("People");

  res.json(result);
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
  const result = await knex("People").where({ id }).delete();
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
