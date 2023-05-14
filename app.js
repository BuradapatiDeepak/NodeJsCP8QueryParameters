const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

let initDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }

  app.listen(3000, () => {
    console.log(`Server Started Successfully`);
  });
};

initDBAndServer();

//API - 1

app.get("/todos/", async (request, response) => {
  const { search_q, priority, status } = request.query;
  console.log(request.query);
  console.log(search_q, priority, status);
  const todoListQuery = `
  SELECT * FROM todo 
  WHERE priority = "${priority}" 
  OR status = "${status}" 
  OR todo LIKE "%${search_q}%"
  ;
  `;
  const todoList = await db.all(todoListQuery);
  response.send(todoList);
});

//API - 2
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const todoQuery = `
    SELECT * FROM todo WHERE id = ${todoId}; 
    `;
  const uniqueTodo = await db.get(todoQuery);
  response.send(uniqueTodo);
});

//API - 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postQuery = `
    INSERT INTO todo(id, todo, priority, status) 
    VALUES (
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
    ); `;
  await db.run(postQuery);
  response.send("Todo Successfully Added");
});

//API - 4
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status } = request.body;
  let bodyContent = request.body;
  console.log(todo, priority, status);
  console.log(request.body);
  let putQuery = ``;
  let responseText = "";
  if (todo !== undefined) {
    responseText = "Todo";
    putQuery = `
       UPDATE todo 
    SET todo = '${todo}'  WHERE id = ${todoId};
    `;
  } else if (priority !== undefined) {
    responseText = "Priority";
    putQuery = `
       UPDATE todo 
    SET priority = '${priority}'  WHERE id = ${todoId};
    `;
  } else if (status !== undefined) {
    responseText = "Status";
    putQuery = `
       UPDATE todo 
    SET status = '${status}' WHERE id = ${todoId};
    `;
  }

  await db.run(putQuery);
  response.send(`${responseText} Updated`);
});

//API - 5
app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
