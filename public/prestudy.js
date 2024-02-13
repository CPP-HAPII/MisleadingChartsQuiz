import {
  userId,
  beginMainStudyButton,
  currentQuestionId,
} from "./mainstudy.js";

export const prestudyContent = document.getElementById("prestudy");
const prestudyQuestionElement = document.getElementById("prestudy-question");
const prestudySubmitButton = document.getElementById("prestudy-submit-button");
const startCalibrationButton = document.getElementById(
  "start-calibration-button"
);
export const prestudyMsgElement = document.getElementById("prestudy-msg");
export const calibrationScreen = document.getElementById("calibration-screen");
const prestudyChart = document.getElementById("prestudy-chart");
var inputElement = document.getElementById("inputText");

let currentQuestionIndex = 0;
let userAnswer;
export let currentQuestion = { value: "" };
export let currentAnswer = { value: null };
export let prestudyQuestions = [
  ["What's your age?", null],
  ["What's your major?", null],
  [
    "The graph above shows the percentage of people who die from different types of cancer." +
      "<br><br>About what percentage of people who die from cancer die from cancer B, cancer C, and cancer D combined?",
    "pie-chart.png",
  ],
  [
    "You see two magazines advertisements on separate pages. Each advertisement is for a different " +
      "drug for treating heart disease. Each advertisement has a graph for showing the effectiveness of the drug " +
      "compared to a placebo (sugar pill).<br><br>Compared to the placebo, which treatment leads to a larger decrease " +
      "in the percentage of patients who die? <br><br> Please enter an answer from the following: Crosicol, Hertinol, They are equal, Can't say",
    "bar-graph.png",
  ],

  [
    "The graph above shows the number of men and women with disease X. The total number of circles is 100.<br><br>" +
      "How many more men than women are there among 100 patients with disease X?",
    "dots.png",
  ],

  [
    "You see two newspaper advertisements on separate pages. Each advertisement is for a different treatment of a skin " +
      "disease. Each advertisement has a graph showing the effectiveness of the treatment over time.<br><br>" +
      "Which of the treatments show a larger decrease in the percentage of sick patients?" +
      "<br><br>Please enter an answer from the following: Apsoriatin, Nopsorian, They are equal, Can't say",
    "line-graph.png",
  ],
];

//display prestudy questions 1 by 1
export function displayPrestudyQuestions(questions) {
  prestudyContent.style.display = "block";
  prestudySubmitButton.style.display = "block";
  startCalibrationButton.style.display = "none";

  console.log("displayPrestudyQuestions is called");

  if (currentQuestionIndex < 6) {
    prestudyQuestionElement.innerHTML = currentQuestion.value =
      questions[currentQuestionIndex][0];
    prestudyChart.innerHTML = "";

    console.log(currentQuestion.value);

    var imageElement = document.createElement("img");
    if (questions[currentQuestionIndex][1] != null) {
      imageElement.src =
        "img/prestudy-img/" + questions[currentQuestionIndex][1];
      imageElement.alt = "prestudy Chart";
      imageElement.style.width = "auto";
      imageElement.style.height = "400px";
      prestudyChart.appendChild(imageElement);
    }
  } else {
    // Survey is complete
    startCalibrationButton.style.display = "block";
    prestudyMsgElement.textContent =
      "Prestudy completed! When you click NEXT, you will be shown a blank screen with a tiny plus sign at the center, please focus your eyes on it for 5 seconds. ";
    prestudyQuestionElement.innerHTML = "";
    prestudySubmitButton.style.display = "none";
    currentQuestionIndex = 0;
    prestudyChart.innerHTML = "";
    inputElement.style.display = "none";
  }
}

//record user response to prestudy questions to database (table prestudy_responses)
async function recordPrestudyResponse() {
  var inputValue = inputElement.value;

  if (!inputValue) {
    alert("Please enter an answer.");
    currentAnswer.value = null;
    return;
  } else {
    currentAnswer.value = inputValue;
  }
  console.log(currentAnswer.value);

  try {
    const responseSubmit = await fetch("/submit-prestudy-response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        userAnswer: currentAnswer.value,
        question: currentQuestion.value.substring(0, 80),
      }),
    });

    const dataSubmit = await responseSubmit.json();
    console.log("Server response:", dataSubmit);

    currentQuestionIndex++;
    displayPrestudyQuestions(prestudyQuestions);
  } catch (error) {
    console.error("Error submitting response:", error);
  }
  inputElement.value = "";
}

//record every button click in database (master_table)
export async function recordInteraction(buttonName, isMainStudy, isPrestudy) {
  let localQuestionId = null;
  let localQuestion = null;
  let localUserAnswer = null;

  if (!isMainStudy && !isPrestudy) {
    localQuestionId = null;
    localQuestion = null;
    localUserAnswer = null;
  } else if (isPrestudy && !isMainStudy) {
    localQuestionId = null;
    localQuestion = currentQuestion.value.substring(0, 80);
    localUserAnswer = currentAnswer.value;
  } else if (isMainStudy && !isPrestudy) {
    localQuestionId = currentQuestionId + 1;
    localQuestion = currentQuestion.value.substring(0, 80);
    localUserAnswer = currentAnswer.value;
  }

  console.log(localUserAnswer);

  try {
    const responseSubmit = await fetch("/submit-user-interaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        buttonName,
        questionId: localQuestionId,
        question: localQuestion,
        userAnswer: localUserAnswer,
      }),
    });

    const dataSubmit = await responseSubmit.json();
    console.log("Server response:", dataSubmit);
  } catch (error) {
    console.error("Error submitting response:", error);
  }
}

//Record prestudy response and user click when prestudySubmitButton is clicked in prestudy_responses
prestudySubmitButton.addEventListener("click", () => {
  recordPrestudyResponse();
  recordInteraction("Submit", false, true);
});

//records user click, hides prestudy content, displays calibration screen, and hides calibration
//screen while starting main study (after 5 seconds) when beginButton is clicked
startCalibrationButton.addEventListener("click", () => {
  recordInteraction("Start Calibration", false, false);
  prestudyContent.style.display = "none";
  calibrationScreen.style.display = "block";
  setTimeout(() => {
    beginMainStudyButton.style.display = "block";
    calibrationScreen.style.display = "none";
  }, 5000);
});
