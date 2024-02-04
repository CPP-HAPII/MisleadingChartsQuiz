const mysql = require("mysql");
require("dotenv").config();

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

con.connect(function (err) {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL server");

  const createTestQuestionsTable = `
    CREATE TABLE IF NOT EXISTS test_questions (
      question_id int PRIMARY KEY AUTO_INCREMENT,
      question_text VARCHAR(255) NOT NULL,
      chart_image VARCHAR(255) NOT NULL,
      options JSON NOT NULL,
      correct_answer VARCHAR(255) NOT NULL
    )
  `;

  const createResponsesTableSQL = `
  CREATE TABLE IF NOT EXISTS test_responses (
    user_id VARCHAR(10) NOT NULL,
    question_id INT,
    question VARCHAR(255),
    user_answer VARCHAR(255),
    is_correct VARCHAR(5) NOT NULL,
    timestamp VARCHAR(40)
  )
`;

  const createPrestudyResponsesTable = `
  CREATE TABLE IF NOT EXISTS prestudy_responses (
    user_id VARCHAR(10) NOT NULL,
    question_text VARCHAR(700),
    user_answer VARCHAR(255),
    timestamp VARCHAR(40)
  )
`;

  const createMasterTable = `
  CREATE TABLE IF NOT EXISTS master_table (
    user_id VARCHAR(10) NOT NULL,
    button_name VARCHAR(100),
    question_id INT,
    question_text VARCHAR(700),
    user_answer VARCHAR(255),
    timestamp VARCHAR(40)
  )
`;

  const insertDataIntoTestQuestionsTable = `
    INSERT INTO test_questions (question_text, chart_image, options, correct_answer) VALUES
    ('According to the chart, there was a day (or days) where there were virtually no new COVID cases.', 'truncated_bar_chart.png', '["True", "False"]', 'False'),
    ('Between January 7th and January 8th, the number of new cases more than doubled.', 'truncated_bar_chart_normal.png', '["True", "False"]', 'False'),
    ('On January 16th, the number of new cases was about half that of the day before.', 'truncated_bar_chart.png', '["True", "False"]', 'False'),
    ('On January 17th, the number of new cases decreased by more than half that of the day before.', 'truncated_bar_chart_normal.png', '["True", "False"]', 'False'),
    ('From January 7 to January 17, the number of new cases generally declined.', 'truncated_bar_chart.png', '["True", "False"]', 'True'),
    ('On January 12, there were about 250 new cases.', 'truncated_bar_chart_normal.png', '["True", "False"]', 'False'),
    ('Between January 9 and January 10, there were less than 5 new COVID cases.', 'truncated_bar_chart.png', '["True", "False"]', 'False'),
    ('On January 9, there were about 245,000 new COVID cases.', 'truncated_bar_chart_normal.png', '["True", "False"]', 'True'),
    ('Between January 13th and January 14th, the number of new COVID cases declined by about 5,000.', 'truncated_bar_chart.png', '["True", "False"]', 'True'),
    ('Between January 7th and January 17th, the highest daily count of new COVID cases surpassed 250,000.', 'truncated_bar_chart_normal.png', '["True", "False"]', 'True'),
    ('Most of the fully vaccinated population became fully vaccinated in April.', '2d_pie_chart.png', '["True", "False"]', 'True'),
    ('By May, about a quarter of the U.S. population was fully vaccinated.', '2d-pie-chart-bar-normal.png', '["True", "False"]', 'False'),
    ('By August, at least half of the U.S. population was fully vaccinated.', '2d-pie-chart-bar-normal.png', '["True", "False"]', 'True'),
    ('In June, half as many people became fully vaccinated as compared to the amount of people vaccinated in May.', '2d-pie-chart-bar-normal.png', '["True", "False"]', 'False'),
    ('In March, more than double the amount of people became fully vaccinated as compared to the amount of people vaccinated in May.', '2d_pie_chart.png', '["True", "False"]', 'False'),
    ('More people became fully vaccinated in the Summer (June, July, August) than in the Spring (March, April, May).', '2d_pie_chart.png', '["True", "False"]', 'True'),
    ('More people became fully vaccinated in July than in February.', '2d-pie-chart-bar-normal.png', '["True", "False"]', 'True'),
    ('More people became fully vaccinated in October than in January.', '2d-pie-chart-bar-normal.png', '["True", "False"]', 'False'),
    ('More than half of the U.S. population was fully vaccinated by October.', '2d_pie_chart.png', '["True", "False"]', 'False'),
    ('January was the month with the least amount of full vaccinations completed.', '2d_pie_chart.png', '["True", "False"]', 'True'),
    ('There were around 3500 people in California hospitalized from COVID in the beginning of April 2021.', 'multiple-scale-line-chart.png', '["True", "False"]', 'False'),
    ('There were around 2100 people in California hospitalized from COVID in the beginning of April 2021.', 'multiple-scale-line-chart-normal.png', '["True", "False"]', 'True'),
    ('There were around 2000 people in California hospitalized from COVID in the beginning of April 2020.', 'multiple-scale-line-chart-normal.png', '["True", "False"]', 'True'),
    ('There were around 1200 people in California hospitalized from COVID in the beginning of April 2020.', 'multiple-scale-line-chart.png', '["True", "False"]', 'False'),
    ('There were around the same number of people in California hospitalized from COVID on April 11 in both 2020 and 2021.', 'multiple-scale-line-chart.png', '["True", "False"]', 'False'),
    ('There were less people in California hospitalized from COVID on April 5 in 2020 than in 2021.', 'multiple-scale-line-chart-normal.png', '["True", "False"]', 'False'),
    ('There were more people in California hospitalized from COVID on April 5 in 2020 than in 2021.', 'multiple-scale-line-chart.png', '["True", "False"]', 'True'),
    ('There were less people in California hospitalized from COVID on April 5 in 2021 than in 2020.', 'multiple-scale-line-chart.png', '["True", "False"]', 'True'),
    ('There were more people in California hospitalized from COVID on April 5 in 2021 than in 2020.', 'multiple-scale-line-chart-normal.png', '["True", "False"]', 'False'),
    ('There were around 1700 people in California hospitalized from COVID in the end of April 2021.', 'multiple-scale-line-chart.png', '["True", "False"]', 'True'),
    ('The day with the lowest number of COVID-related deaths in California in January was near the end of the month.', 'reversed-axis-bar-chart.png', '["True", "False"]', 'False'),
    ('The day with the lowest number of COVID-related deaths in California in January was near the beginning of the month.', 'reversed-axis-bar-chart.png', '["True", "False"]', 'True'),
    ('The day with the highest number of COVID-related deaths in California in January was in the first half of the month.', 'reversed-axis-bar-chart.png', '["True", "False"]', 'False'),
    ('The day with the highest number of COVID-related deaths in California in January was in the second half of the month.', 'reversed-axis-bar-chart-normal.png', '["True", "False"]', 'True'),
    ('There were more COVID-related deaths in California in the first half of the month than the second half.', 'reversed-axis-bar-chart.png', '["True", "False"]', 'False'),
    ('There were more COVID-related deaths in California in the second half of the month than the first half.', 'reversed-axis-bar-chart-normal.png', '["True", "False"]', 'True'),
    ('There were less COVID-related deaths in California in the first half of the month than the second half.', 'reversed-axis-bar-chart-normal.png', '["True", "False"]', 'True'),
    ('There were less COVID-related deaths in California in the second half of the month than the first half.', 'reversed-axis-bar-chart.png', '["True", "False"]', 'False'),
    ('The number of COVID-related deaths in California in January were trending upwards overall as time passed.', 'reversed-axis-bar-chart.png', '["True", "False"]', 'True'),
    ('The number of COVID-related deaths in California in January were trending downwards overall as time passed.', 'reversed-axis-bar-chart-normal.png', '["True", "False"]', 'False'),
    ('No vaccines had been administered at the beginning of January.', 'truncated-line-chart-normal.png', '["True", "False"]', 'False'),
    ('Around 600,000 total vaccines had been administered at the beginning of January.', 'truncated-line-chart.png', '["True", "False"]', 'True'),
    ('No vaccines had been administered at the beginning of February.', 'truncated-line-chart-normal.png', '["True", "False"]', 'False'),
    ('Around 4,500,000 total vaccines had been administered at the beginning of February.', 'truncated-line-chart-normal.png', '["True", "False"]', 'True'),
    ('Vaccines were administered in January.', 'truncated-line-chart-normal.png', '["True", "False"]', 'True'),
    ('Vaccines were administered in February.', 'truncated-line-chart.png', '["True", "False"]', 'True'),
    ('Vaccines began getting administered in March (according to the chart).', 'truncated-line-chart.png', '["True", "False"]', 'False'),
    ('Vaccines had been administered before March (according to the chart).', 'truncated-line-chart-normal.png', '["True", "False"]', 'True'),
    ('The total number of vaccines administered at the beginning of March was around 0.', 'truncated-line-chart.png', '["True", "False"]', 'False'),
    ('The total number of vaccines administered at the beginning of March was around 100,000.', 'truncated-line-chart-normal.png', '["True", "False"]', 'True')
    `;

  con.query(createTestQuestionsTable, (err) => {
    if (err) {
      console.error("Error creating test_questions table:", err);
    } else {
      console.log("test_questions table created successfully");
    }
  });

  // insert data after creating the table
  con.query(insertDataIntoTestQuestionsTable, (err) => {
    if (err) {
      console.error("Error inserting data into test_questions table:", err);
    } else {
      console.log("Data inserted into test_questions table successfully");
    }
  });

  con.query(createResponsesTableSQL, (err) => {
    if (err) {
      console.error("Error creating test_responses table:", err);
    } else {
      console.log("test_responses table created successfully");
    }
  });

  con.query(createPrestudyResponsesTable, (err) => {
    if (err) {
      console.error("Error creating poststudy_questions table:", err);
    } else {
      console.log("poststudy_questions table created successfully");
    }
  });

  con.query(createMasterTable, (err) => {
    if (err) {
      console.error("Error creating master_table:", err);
    } else {
      console.log("master_table created successfully");
    }
  });

  // Close the connection
  con.end((error) => {
    if (error) {
      console.error("Error closing MySQL connection:", error);
      return;
    }
    console.log("MySQL connection closed.");
  });
});
