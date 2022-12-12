const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
app.use(express.json());

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

//get todos api
const convertToObject = (dR) => {
  return {
    id: dR.id,
    todo: dR.todo,
    priority: dR.priority,
    status: dR.status,
    category: dR.category,
    dueDate: dR.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q, category } = request.query;
  const statusPresent =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  const priorityPresent =
    priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
  const categoryPresent =
    category === "WORK" || category === "HOME" || category === "LEARNING";

  if (status !== undefined) {
    if (statusPresent) {
      const getStatusQuery = `select * from todo where status='${status}';`;
      const dbResponse = await db.all(getStatusQuery);
      const result = dbResponse.map((dR) => {
        return convertToObject(dR);
      });
      response.send(result);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (priority !== undefined) {
    if (priorityPresent) {
      const getPriorityQuery = `select * from todo where priority='${priority}';`;
      const dbResponse1 = await db.all(getPriorityQuery);
      const result = dbResponse1.map((dR) => {
        return convertToObject(dR);
      });
      response.send(result);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (status !== undefined && priority !== undefined) {
    if (statusPresent && priorityPresent) {
      const getPriorityAndStatusQuery = `select * from todo where priority='${priority}' and status='${status}'`;
      const dbResponse2 = await db.all(getPriorityAndStatusQuery);
      const result = dbResponse2.map((dR) => {
        return convertToObject(dR);
      });
      response.send(result);
    }
  } else if (search_q !== undefined) {
    const getSearchqQuery = `select * from todo where todo LIKE '%${search_q}%';`;
    const dbResponse3 = await db.all(getSearchqQuery);
    const result = dbResponse3.map((dR) => {
      return convertToObject(dR);
    });
    response.send(result);
  } else if (status !== undefined && category !== undefined) {
    const getCategoryAndStatusQuery = `select * from todo where category like '${category}' and status like '${status}';`;
    const dbResponse4 = await db.all(getCategoryAndStatusQuery);
    const result = dbResponse4.map((dR) => {
      return convertToObject(dR);
    });
    response.send(result);
  } else if (category !== undefined) {
    if (categoryPresent) {
      const getCategoryQuery = `select * from todo where category like '${category}'`;
      const dbResponse5 = await db.all(getCategoryQuery);
      const result = dbResponse5.map((dR) => {
        return convertToObject(dR);
      });
      response.send(result);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }
});

//get todo api

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `select * from todo where id=${todoId};`;
  const dbResponse = await db.get(getTodoQuery);
  console.log(dbResponse);
  response.send(convertToObject(dbResponse));
});

//get todo api using due date

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  try {
    const formattedDate = format(new Date(date), "yyyy-MM-dd");
    const isValidDate = isValid(new Date(formattedDate));
    if (isValidDate) {
      const getTodo = `select * from todo where due_date='${formattedDate}';`;
      const dbResponse = await db.all(getTodo);
      console.log(getTodo);
      const result = dbResponse.map((dR) => {
        return convertToObject(dR);
      });
      response.send(result);
    }
  } catch (e) {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//create a todo  api

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, dueDate, category } = request.body;
  const dateValidOrNot = isValid(new Date(dueDate)) === true;
  const statusPresent =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  const priorityPresent =
    priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
  const categoryPresent =
    category === "WORK" || category === "HOME" || category === "LEARNING";

  if (!statusPresent) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (!priorityPresent) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (!categoryPresent) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (!dateValidOrNot) {
    response.status(400);
    response.send("Invalid Due Date");
  } else if (
    statusPresent &&
    priorityPresent &&
    categoryPresent &&
    dateValidOrNot
  ) {
    const createTodo = `insert into todo (id,todo,priority,status,due_date,category)
            values(${id},'${todo}','${priority}','${status}','${dueDate}','${category}')`;
    const dbResponse = await db.run(createTodo);
    console.log(dbResponse);
    response.send("Todo Successfully Added");
  }
});

//update todo api

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  const statusPresent =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  const priorityPresent =
    priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
  const categoryPresent =
    category === "WORK" || category === "HOME" || category === "LEARNING";
  if (status !== undefined) {
    if (statusPresent) {
      const updateStatusQuery = `update todo set status='${status}' where id=${todoId};`;
      await db.run(updateStatusQuery);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (priority !== undefined) {
    if (priorityPresent) {
      const updatePriorityQuery = `update todo set priority='${priority}' where id=${todoId};`;
      const dbResponse = await db.run(updatePriorityQuery);
      console.log(dbResponse);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (todo !== undefined) {
    const updateTodoQuery = `update todo set todo='${todo}' where id=${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Todo Updated");
  } else if (category !== undefined) {
    if (categoryPresent) {
      const updateCategoryQuery = `update todo set category='${category}' where id=${todoId};`;
      await db.run(updateCategoryQuery);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    try {
      const formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
      const isValidDate = isValid(new Date(formattedDate));
      if (isValidDate) {
        const updateDateQuery = `update todo set due_date='${formattedDate}' where id=${todoId};`;
        await db.run(updateDateQuery);
        response.send("Due Date Updated");
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
    }
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
