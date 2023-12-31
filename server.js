const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

//Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

let userId = 0;
app.get("/claim-user-id", async (req, res) => {
  userId++;

  try {
    res.json({ userId });
  } catch (error) {
    console.error("Error fetching next question:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//fetch entire table test_questions at once
app.get("/fetch-entire-table", async (req, res) => {
  try {
    const tableData = await fetchEntireTableFromDatabase("test_questions");
    res.json({ data: tableData });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Define a route to submit a response
app.post("/submit-response", async (req, res) => {
  const { userId, userAnswer, questionNumber, question, isCorrect } = req.body;

  try {
    const timestamp = new Date();

    //Insert the response into the test_responses
    await insertResponseIntoDatabase(
      userId,
      questionNumber,
      question,
      userAnswer,
      isCorrect,
      timestamp
    );

    res.json({
      status: "success submitting response to test_responses",
      message: "User response received",
    });
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Insert a response into test_responses
function insertResponseIntoDatabase(
  userId,
  questionId,
  question,
  userAnswer,
  isCorrect,
  timestamp
) {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO test_responses (user_id, question_id, question, user_answer, is_correct, timestamp) VALUES (?, ?, ?, ?, ?, ?)";
    connection.query(
      query,
      [userId, questionId, question, userAnswer, isCorrect, timestamp],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}

function fetchEntireTableFromDatabase(tableName) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM ${tableName}`;
    connection.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching table data:", err);
        reject(err);
      } else {
        console.log("Fetched table data:", results);
        resolve(results);
      }
    });
  });
}

function insertPrestudyResponseIntoDatabase(
  userId,
  question,
  userAnswer,
  timestamp
) {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO prestudy_responses (user_id, question_text, user_answer, timestamp) VALUES (?, ?, ?, ?)";

    connection.query(
      query,
      [userId, question, userAnswer, timestamp],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}

app.post("/submit-prestudy-response", async (req, res) => {
  const { userId, userAnswer, question } = req.body;

  try {
    const timestamp = new Date();

    // Insert the response into the database
    await insertPrestudyResponseIntoDatabase(
      userId,
      question,
      userAnswer,
      timestamp
    );

    res.json({
      status: "success submitting responses to prestudy_responses",
      message: "User response received",
    });
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function insertDataIntoMasterTable(
  userId,
  button,
  questionId,
  question,
  userAnswer,
  timestamp
) {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO master_table (user_id, button_name, question_id, question_text, user_answer, timestamp) VALUES (?, ?, ?, ?, ?, ?)";

    connection.query(
      query,
      [userId, button, questionId, question, userAnswer, timestamp],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}

//Submit user click to master_table
app.post("/submit-user-interaction", async (req, res) => {
  const { userId, buttonName, questionId, userAnswer, question } = req.body;

  try {
    const timestamp = new Date();

    // Insert the response into the database
    await insertDataIntoMasterTable(
      userId,
      buttonName,
      questionId,
      question,
      userAnswer,
      timestamp
    );

    res.json({
      status: "success submitting to master_table",
      message: "User response received",
    });
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
