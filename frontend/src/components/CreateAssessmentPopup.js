import { Link } from "react-router-dom";
import "../styles/style-assessments-homepage.css";

const CreateAssessmentPopup = ({ toggleCreatePrompt }) => {
  return (
    <>
      <div className="prompt-container">
        <h1> Create New Assessment </h1>
        <p>
          {" "}
          It's time to test how far the student has learned on a specific topic.{" "}
          <br />
          Choose the type of assessment you wish to create.
        </p>
        <div className="options-container">
          <Link to="/create-assessment?type=quiz">
            <div className="option-box">
              <img
                src="/assets/images/quiz-icon.png"
                height="185"
                width="200"
              />
              <h2> Quiz Type </h2>
              <p>
                {" "}
                Quiz is a quick way to assess students on a topic. Recommended
                for short and simple assessments.{" "}
              </p>
            </div>
          </Link>
          <div className="bruh"></div>
          <Link to="/create-assessment?type=exam">
            <div className="option-box">
              <img
                src="/assets/images/exam-icon.png"
                height="185"
                width="200"
              />
              <h2> Exam Type </h2>
              <p>
                {" "}
                Exams are a comprehensive assessment on multiple topics.
                Recommended for long form assessments.{" "}
              </p>
            </div>
          </Link>
        </div>
        <Link onClick={toggleCreatePrompt}>
          <div className="generic-button-variant"> Cancel </div>
        </Link>
      </div>
      <div className="overlay"></div>
    </>
  );
};

export default CreateAssessmentPopup;
