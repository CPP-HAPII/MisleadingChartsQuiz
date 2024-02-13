import {
  prestudyQuestions,
  displayPrestudyQuestions,
  prestudyContent,
  recordInteraction,
  currentQuestion,
  currentAnswer,
  calibrationScreen,
} from "./prestudy.js";

import { questionOrder } from "./mainStudyOrderSequence.js";

//main study elements
const studyContent = document.getElementById("study-content");
const questionElement = document.getElementById("question");
const optionsElement = document.getElementById("options");
const submitButton = document.getElementById("submit-button");
const prestudyNotif = document.getElementById("prestudy-notif");
const beginStudyButton = document.getElementById("begin-study-button");
export const beginMainStudyButton = document.getElementById(
  "begin-main-study-button"
);

//welcome screen or home screen
export const homeContent = document.getElementById("home-content");
const claimUserIDButton = document.getElementById("claim-user-id");
const showUserID = document.getElementById("show-user-id");

//prestudy elements
const beginPrestudyButton = document.getElementById("begin-prestudy-button");
const chartPlaceholder = document.getElementById("chart");

//end of study
const postStudyCongrats = document.getElementById("congrats-cat");

export let currentQuestionId;
let currentQuestionIndex = 0;
let currentCorrectAnswer;
export let userId = 0; //Declare userId globally
let questionOrderRow;

let tableData = [];
let data2DArray = []; //stores all queries from test_questions in database locally

//display main study questions 1 by 1
function displayQuestion() {
  if (currentQuestionIndex < 50) {
    submitButton.style.display = "block";
    questionOrderRow = userId - 1;

    //assign value to question
    questionElement.textContent = currentQuestion.value =
      currentQuestionIndex +
      1 +
      ". " +
      data2DArray[questionOrder[questionOrderRow][currentQuestionIndex]][0];
    optionsElement.innerHTML = "";
    chartPlaceholder.innerHTML = "";
    currentQuestionId = questionOrder[questionOrderRow][currentQuestionIndex];
    console.log(currentQuestion.value);

    //assign this question's correct answer to currentCorrectAnswer for answer checking
    currentCorrectAnswer =
      data2DArray[questionOrder[questionOrderRow][currentQuestionIndex]][3];

    // Create and append the image element
    const imageElement = document.createElement("img");
    imageElement.src =
      "img/" +
      data2DArray[questionOrder[questionOrderRow][currentQuestionIndex]][1];
    console.log(
      data2DArray[questionOrder[questionOrderRow][currentQuestionIndex]][1]
    );
    imageElement.alt = "Chart";
    imageElement.style.width = "auto"; // Set the desired width
    imageElement.style.height = "600px"; // Set the desired height
    chartPlaceholder.appendChild(imageElement);

    data2DArray[
      questionOrder[questionOrderRow][currentQuestionIndex]
    ][2].forEach((option, index) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = option;
      label.appendChild(input);
      label.appendChild(document.createTextNode(option));
      optionsElement.appendChild(label);
    });
  } else {
    //Study is complete
    currentQuestionIndex = 0;
    postStudyCongrats.style.display = "block";
    questionElement.textContent =
      "Study complete. Thank you for participating!";
    optionsElement.innerHTML = "";
    chartPlaceholder.innerHTML = "";
    submitButton.style.display = "none";
  }
}

async function claimUserID() {
  try {
    //Fetch userId from the server when starting the survey
    const response = await fetch("/claim-user-id", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    userId = data.userId; // Store the userId globally or in a scope accessible by the checkAnswer function
    showUserID.textContent = "Your user ID is: " + userId;
    recordInteraction("Claim User ID", false, false);

    prestudyNotif.style.display = "block";

    console.log("User Id: " + userId);
    claimUserIDButton.style.display = "none";
    beginPrestudyButton.style.display = "block";
  } catch (error) {
    console.error("Error claim user ID:", error);
  }
}

//Start the main study
export async function beginMainStudy() {
  try {
    const response = await fetch("/fetch-entire-table", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    tableData = data;

    storeQuestionsInArray();

    homeContent.style.display = "none"; // Hide the welcome message
    studyContent.style.display = "block"; // Show the study content
    beginMainStudyButton.style.display = "none";

    displayQuestion(); //display main study question
  } catch (error) {
    console.error("Error starting the study:", error);
  }
}

function storeQuestionsInArray() {
  for (const entry of tableData.data) {
    const questionText = entry.question_text;
    const chartImage = entry.chart_image;
    const options = entry.options;
    const correctAnswer = entry.correct_answer;
    const questionID = entry.question_id;

    //temp array with extracted data
    const rowArray = [
      questionText,
      chartImage,
      options,
      correctAnswer,
      questionID,
    ];

    data2DArray.push(rowArray); //store all fetched data from table_questions into local 2d array data2DArray
  }
}

// Function to check the answer and proceed to the next question
async function checkAnswer() {
  let selectedOption = document.querySelector('input[name="answer"]:checked');

  if (!selectedOption) {
    alert("Please select an answer.");
    return;
  }

  currentAnswer.value = selectedOption;
  console.log(currentAnswer.value);

  try {
    const responseSubmit = await fetch("/submit-response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        userAnswer: selectedOption,
        questionNumber: currentQuestionId + 1,
        question: currentQuestion.value.substring(0, 100),
        isCorrect: selectedOption === currentCorrectAnswer,
      }),
    });

    const dataSubmit = await responseSubmit.json();
    console.log("Server response:", dataSubmit);

    currentQuestionIndex++;
    displayQuestion();
  } catch (error) {
    console.error("Error submitting response:", error);
  }
}

// Add event listeners
submitButton.addEventListener("click", () => {
  checkAnswer();
  recordInteraction("Submit", true, false);
});

beginPrestudyButton.addEventListener("click", () => {
  recordInteraction("Begin Prestudy", false, false);
  homeContent.style.display = "none";
  displayPrestudyQuestions(prestudyQuestions);
});

claimUserIDButton.addEventListener("click", () => {
  claimUserID();
});

beginStudyButton.addEventListener("click", () => {
  recordInteraction("Begin Study", false, false);
  homeContent.style.display = "block";
  beginStudyButton.style.display = "none";
});

beginMainStudyButton.addEventListener("click", () => {
  recordInteraction("Begin Main Study", false, false);
  beginMainStudy();
});

// Initially, show the welcome message and hide the study content
homeContent.style.display = "none";
studyContent.style.display = "none";
prestudyContent.style.display = "none";
