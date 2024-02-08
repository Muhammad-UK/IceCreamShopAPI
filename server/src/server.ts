import express from "express";
import pg from "pg";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

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
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = /*sql*/ `
      SELECT *
      FROM flavors
      WHERE id = $1
    `;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    if (!req.body.name && req.body.is_favorite) {
      req.body.is_favorite;
      const SQL = /*sql*/ `
          UPDATE flavors
          SET is_favorite = $1
          WHERE id = $2;
        `;
      await client.query(SQL, [req.body.is_favorite, req.params.id]);
    } else if (!req.body.is_favorite && req.body.name) {
      const SQL = /*sql*/ `
      UPDATE flavors
      SET name = $1
      WHERE id = $2;
    `;
      await client.query(SQL, [req.body.name, req.params.id]);
    } else if (req.body.name && req.body.is_favorite) {
      const SQL = /*sql*/ `
        UPDATE flavors
        SET name = $1, is_favorite = $2
        WHERE id  = $3;
      `;
      await client.query(SQL, [
        req.body.name,
        req.body.is_favorite,
        req.params.id,
      ]);
    } else {
      return next("There was an Error with the body");
    }
    const SQL = /*sql*/ `
      SELECT * 
      FROM flavors 
      WHERE id = $1;
    `;
    const response = await client.query(SQL, [req.params.id]);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/flavors", async (req, res, next) => {
  try {
    if (!req.body.name) return next("There was an Error with the body");
    const SQL = /*sql*/ `
      INSERT INTO flavors(name) VALUES($1) RETURNING *
    `;
    const response = await client.query(SQL, [req.body.name]);
    res.status(201).send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = /*sql*/ `
      DELETE FROM flavors
      WHERE id = $1
    `;
    await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
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
        is_favorite BOOLEAN DEFAULT false,
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
