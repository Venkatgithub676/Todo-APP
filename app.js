const express = require("express");
var format = require("date-fns/format");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require("bcrypt");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(`DB error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//middleware function for invalid details

const invalidDetailsChecking = (request, response, next) => {
  const { id, todo, category, priority, status, due_date } = request.body;
  if (status !== undefined) {
  }
};

//get todos api

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q, category } = request.query;
  const getStatusQuery = `select * from todo where status='${status}';`;
  const getPriorityQuery = `select * from todo where priority='${priority}';`;
  const getPriorityAndStatusQuery = `select * from todo where priority='${priority}' and status='${status}'`;
  const getSearchqQuery = `select * from todo where todo LIKE '%${search_q}%';`;
  const getCategoryAndStatusQuery = `select * from todo where category like '${category}' and status like '${status}';`;
  const getCategoryQuery = `select * from todo where category like '${category}'`;
  const dbResponse = await db.all(getStatusQuery);
  const dbResponse1 = await db.all(getPriorityQuery);
  const dbResponse2 = await db.all(getPriorityAndStatusQuery);
  const dbResponse3 = await db.all(getSearchqQuery);
  const dbResponse4 = await db.all(getCategoryAndStatusQuery);
  const dbResponse5 = await db.all(getCategoryQuery);

  if (status !== undefined) {
    switch (true) {
      case dbResponse !== []:
        return response.send(dbResponse);
        break;
      case dbResponse === []:
        response.status(400);
        return response.send("Invalid Todo Status");
        break;
    }
  } else if (priority !== undefined) {
    response.send(dbResponse1);
  } else if (status !== undefined && priority !== undefined) {
    response.send(dbResponse2);
  } else if (search_q !== undefined) {
    response.send(dbResponse3);
  } else if (status !== undefined && category !== undefined) {
    response.send(dbResponse4);
  } else if (category !== undefined) {
    response.send(dbResponse5);
  }
});

//get todo api

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `select * from todo where id=${todoId};`;
  const dbResponse = await db.get(getTodoQuery);
  console.log(dbResponse);
  response.send(dbResponse);
});

//get todo api using due date

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const dueDate = format(new Date(date), "yyyy-MM-dd");
  const getTodo = `select * from todo where due_date='${dueDate}';`;
  const dbResponse = await db.all(getTodo);
  console.log(getTodo);
  response.send(dbResponse);
});

//create a todo  api

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const createTodo = `insert into todo (id,todo,priority,status,category,due_date)
    values(${id},'${todo}','${priority}','${status}','${dueDate}','${category}')`;
  await db.run(createTodo);
  response.send("Todo Successfully Added");
});

//update todo api

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  const updateStatusQuery = `update todo set status='${status}' where id=${todoId};`;
  const updatePriorityQuery = `update todo set priority='${priority}' where id=${todoId};`;
  const updateTodoQuery = `update todo set todo='${todo}' where id=${todoId};`;
  const updateCategoryQuery = `update todo set category='${category}' where id=${todoId};`;
  const updateDateQuery = `update todo set due_date='${dueDate}' where id=${todoId};`;
  if (status !== undefined) {
    await db.run(updateStatusQuery);
    response.send("Status Updated");
  } else if (priority !== undefined) {
    await db.run(updatePriorityQuery);
    response.send("Priority Updated");
  } else if (todo !== undefined) {
    await db.run(updateStatusQuery);
    response.send("Todo Updated");
  } else if (category !== undefined) {
    await db.run(updateCategoryQuery);
    response.send("Category Updated");
  } else {
    await db.run(updateDateQuery);
    response.send("Due Date Updated");
  }
});

//delete todo api

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `delete from todo where id=${todoId}`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
