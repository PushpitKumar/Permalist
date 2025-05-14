import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Main",
  password: "**************",
  port: 5432
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  try {
    items = await getItems();
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (err) {
    console.error("Server Error", err.stack);
  }
});

app.post("/add", async (req, res) => {
  try {
    const item = req.body.newItem;
    //items.push({ title: item });
    if (item !== "") {
      console.log("Adding New Item");
      const insertedData = await db.query("INSERT INTO Items (Title) VALUES($1) RETURNING *", [item]);
      console.log(insertedData.rows[0]);
    }
    res.redirect("/");
  } catch (err) {
    console.error("Server Error", err.stack);
  }
});

app.post("/edit", async (req, res) => {
  try {
    const itemId = req.body.updatedItemId;
    const itemTitle = req.body.updatedItemTitle;
    if (itemId !== "" && itemTitle !== "") {
      console.log(`Updating Item${itemId} in DB`);
      const updatedData = await db.query("UPDATE Items SET Title = ($1) WHERE Id = ($2) RETURNING *", [itemTitle, itemId]);
      console.log(updatedData.rows[0]);
    }
    res.redirect("/");
  } catch (err) {
    console.error("Server Error", err.stack);
  }
});

app.post("/delete", async (req, res) => {
  try {
      const itemId = req.body.deleteItemId;
      if (itemId) {
        console.log(`Deleting Item${itemId}`);
        const deletedData = await db.query("DELETE FROM Items WHERE Id = ($1) RETURNING *", [itemId]);
        console.log(deletedData.rows[0]);
      }
      res.redirect("/");
  } catch (err) {
    console.error("Server Error", err.stack);
  }
});

async function getItems() {
  try {
    const dataset = await db.query("SELECT * FROM Items ORDER BY Id");
    const result = dataset.rows;
    console.log(result);
    return result;
  }
  catch (err) {
    console.error("Failed to retrieve data", err.stack);
  }
}

// Only call db.end() when app is shutting down
process.on("SIGINT", async () => {
  await db.end();
  console.log("Database connection closed.");
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});