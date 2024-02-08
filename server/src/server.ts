import express from "express";
import pg from "pg";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors());

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_ice_cream_shop_db"
);
app.use(express.static(path.join(__dirname, "../../client/dist")));
app.get("/", async (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
  } catch (error) {
    next(error);
  }
});

app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = /*sql*/ `
      SELECT *
      FROM flavors
    `;
    const response = await client.query(SQL);
    res.send({
      data: response.rows,
    });
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  console.log("Connecting to database...");
  await client.connect();
  console.log("Connected to database successfully");

  let SQL = /*sql*/ `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        is_favorite BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await client.query(SQL);
  console.log("Tables created");
  SQL = /*sql*/ `
    INSERT INTO flavors(name) VALUES ('vanilla');
    INSERT INTO flavors(name) VALUES ('chocolate');
    INSERT INTO flavors(name) VALUES ('mint');
    INSERT INTO flavors(name) VALUES ('rainbow sherbert');
    INSERT INTO flavors(name) VALUES ('cotton candy');
    INSERT INTO flavors(name) VALUES ('watermelon');
    INSERT INTO flavors(name) VALUES ('cookie dough');
    INSERT INTO flavors(name) VALUES ('cookies n cream');

  `;
  await client.query(SQL);
  console.log("Data seeded");

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log("listening on port"));
};

init();
