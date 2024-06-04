import axios from "axios";
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AssessmentSection from "../components/AssessmentSection";
import Header from "../components/Header";
import UserContext from "../contexts/UserContext";

import { useEffect, useState } from "react";

const CreateAssessmentPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const assessment_type = searchParams.get("type");

  const [token, setToken] = useState();
  const [selectedOption, setSelectedOption] = useState("");
  const [sectionCounter, setSectionCounter] = useState(1);
  const [learningOutcomeCounter, setLearningOutcomeCounter] = useState(1);
  const [sections, setSections] = useState([]);
  const [fileList, setFileList] = useState([]);

  const { user } = React.useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.isAuthenticated) {
      navigate("/login");
    }
  }, [user, navigate]);

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  const client = axios.create({
    baseURL: "http://localhost:8000/",
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
    },
  });

  const displayFileNames = (event) => {
    const files = Array.from(event.target.files);
    setFileList(files);
    event.target.value = "";
  };

  const addFiles = (event) => {
    const files = Array.from(event.target.files);
    setFileList((prevFileList) => {
      const newFiles = files.filter(
        (file) => !prevFileList.some((prevFile) => prevFile.name === file.name)
      );
      return [...prevFileList, ...newFiles];
    });
    event.target.value = "";
  };

  const removeFile = (index) => {
    setFileList((prevFileList) => {
      return prevFileList.filter((file, i) => i !== index);
    });
  };

  function showPrompt() {
    document.getElementById("promptContainer").style.display = "flex";
    document.getElementById("overlay").style.display = "block";
  }

  function closePrompt() {
    document.getElementById("promptContainer").style.display = "none";
    document.getElementById("overlay").style.display = "none";
  }

  function selectOption(e) {
    const option = e.target.textContent;
    setSelectedOption(option);
    e.target.parentNode.style.display = "none";
  }

  function addInputElement(containerID) {
    setLearningOutcomeCounter((prevCounter) => prevCounter + 1);
    var newContainer = document.createElement("div");
    var newInput = document.createElement("input");
    var deleteButton = document.createElement("button");

    newInput.type = "text";
    newInput.placeholder = `Learning Outcome ${learningOutcomeCounter}`;
    newInput.name = `learning-outcomes_${learningOutcomeCounter}`;

    deleteButton.textContent = "X";
    deleteButton.onclick = function () {
      newContainer.remove();
      learningOutcomeCounter--;
    };

    newInput.classList.add("generic-form-textbox");
    deleteButton.classList.add("learning-outcome-delete-button");
    newContainer.classList.add("learning-outcome-container");

    newContainer.appendChild(newInput);
    newContainer.appendChild(deleteButton);

    document.getElementById(containerID).appendChild(newContainer);
  }

  const toggleDropdown = (event) => {
    const dropdownOptions = event.target.nextElementSibling;
    dropdownOptions.style.display =
      dropdownOptions.style.display === "block" ? "none" : "block";
  };

  const removeSection = (indexToRemove) => {
    setSections((prevSections) =>
      prevSections.filter((_, index) => index !== indexToRemove)
    );
    setSectionCounter((prevCounter) => prevCounter - 1);
  };

  const addNewSection = () => {
    if (assessment_type === "exam") {
      setSectionCounter((prevCounter) => prevCounter + 1);
      setSections((prevSections) => [
        ...prevSections,
        <div key={sectionCounter}>
          <AssessmentSection sectionCounter={sectionCounter} />
          <button
            className="learning-outcome-delete-button"
            onClick={() => removeSection(sectionCounter - 1)}
          >
            Remove Learning Outcome
          </button>
        </div>,
      ]);
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();

    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken"))
      ?.split("=")[1];
    if (csrfToken) {
      setToken(csrfToken);
    } else {
      console.log(
        "CSRF token not found. Please refresh the page and try again."
      );
    }

    if (!csrfToken) {
      console.log(
        "CSRF token not found. Please refresh the page and try again."
      );
      return;
    }

    let formData = new FormData();

    const assessmentName =
      document.getElementsByName("assessment_name")[0].value;

    console.log(assessmentName);

    const assessmentDescription = document.getElementsByName(
      "assessment_description"
    )[0].value;

    console.log(assessmentDescription);

    const lesson = document.getElementsByName("lesson")[0].value;

    let sections = [];
    for (let i = 1; i <= sectionCounter; i++) {
      const sectionTypeElement = document.getElementsByName(
        `section-type_${i}`
      )[0];
      const sectionLengthElement = document.getElementsByName(
        `section-length_${i}`
      )[0];
      const learningOutcomesContainer = document.getElementById(
        `learning-outcomes_${i}`
      );

      if (
        sectionTypeElement &&
        sectionLengthElement &&
        learningOutcomesContainer
      ) {
        const sectionType = sectionTypeElement.value;
        const sectionLength = sectionLengthElement.value;
        const learningOutcomes = Array.from(
          learningOutcomesContainer.children
        ).map((child) => child.firstChild.value);
        sections.push({ sectionType, sectionLength, learningOutcomes });
      } else {
        console.warn(
          `Elements for section ${i} are missing or not fully rendered.`
        );
      }
    }

    formData.append("assessment_name", assessmentName);
    formData.append("assessment_description", assessmentDescription);
    formData.append("type", assessment_type);
    formData.append("lesson", lesson);
    formData.append("sections", JSON.stringify(sections));
    formData.append("user", user);

    const lessonFileElement = document.getElementsByName("lesson_file")[0];
    if (lessonFileElement && lessonFileElement.files.length > 0) {
      formData.append("lesson_file", lessonFileElement.files[0]);
    }

    for (let pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    try {
      const response = await client.post("/create_assessment", formData, {
        headers: {
          "X-CSRFToken": token,
        },
      });

      if (response.status === 200) {
        const data = response.data;
        navigate(`/view-assessment/${data.assessment_id}?action=view`);
      } else {
        console.error("Error creating assessment:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <Header csrfToken={token} />
      <main className="generic-content-container">
        <Link to="/home">
          <h2 style={{ marginTop: 0 }}>Back to My Assessments</h2>
        </Link>
        <div className="content-header">
          <img
            src="assets/images/quiz-icon.png"
            id="header-icon"
            width="115"
            height="110"
          />
          <h1 id="header-title">
            {" "}
            Create{" "}
            {assessment_type.charAt(0).toUpperCase() +
              assessment_type.slice(1)}{" "}
            Type Assessment{" "}
          </h1>
        </div>

        <form
          className="assessment-form"
          id="assessment-creation-form"
          method="post"
          encType="multipart/form-data"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="general-attributes-form">
            <h2> Assessment Information </h2>
            <p id="header-subtitle">
              {" "}
              Quiz is a quick way to assess students on a topic. Recommended for
              short and simple assessments.{" "}
            </p>{" "}
            <br />
            <label> Assessment Name </label> <br />
            <input
              className="generic-form-textbox"
              type="text"
              placeholder="What's the name of your assessment?"
              name="assessment_name"
            />
            <br />
            <label> Assessment Description </label>
            <input
              className="generic-form-textbox"
              type="text"
              placeholder="What is this assessment about? Give your assessment a short description."
              name="assessment_description"
            />
            <br />
            <br />
            <br />
            <h2> Learning Materials </h2>
            <p>
              {" "}
              The material provided will be the source and the basis of the
              assessment that would be generated by the system. Please have a
              source material that is descriptive and comprehensive as to
              generate an equally quality assessment.{" "}
            </p>{" "}
            <br />
            <label> Materials Editor </label>
            <textarea
              className="generic-form-textarea-variant"
              id="material-textarea"
              placeholder="Start by writing to the text area or upload a PDF as a material. Anything written here is ignored if a file has been uploaded."
              name="lesson"
            ></textarea>{" "}
            <br />
            <br />
            <div className="custom-file-container">
              <label
                htmlFor="fileInput"
                id="material-file-upload"
                className="custom-file-button"
              >
                {fileList.length > 0 ? "Add File" : "Choose Files"}
              </label>
              <input
                style={{ display: "none" }}
                id="fileInput"
                type="file"
                onChange={fileList.length > 0 ? addFiles : displayFileNames}
                accept=".pdf,.docx,.txt"
                multiple
              />
              {fileList.length === 0 ? (
                <p>No File Chosen</p>
              ) : (
                fileList.map((file, index) => (
                  <div key={index}>
                    <span>{file.name}</span>
                    <button onClick={() => removeFile(index)}>
                      Remove File
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="generator-attributes-form">
            <h2> AI Generator Settings </h2>
            <p>
              Need your assessments to be fine-tuned to your liking? <br />
              You can specify learning objectives to set standards to a student
              taking this assessment.
            </p>
            <div>
              {assessment_type === "quiz" ? (
                <div>
                  <h2 className="exam-part"> Section 1 </h2> <br />
                  <label> Assessment Type </label>
                  <div className="dropdown-container">
                    <input
                      type="text"
                      className="generic-form-textbox"
                      placeholder="Select an option"
                      onClick={toggleDropdown}
                      name={`section-type_${sectionCounter}`}
                      value={selectedOption}
                      readOnly
                    />
                    <ul className="dropdown-options">
                      <li onClick={(e) => selectOption(e)}>Multiple Choice</li>
                      <li onClick={(e) => selectOption(e)}>True or False</li>
                      <li onClick={(e) => selectOption(e)}>
                        Fill in The Blanks
                      </li>
                      <li onClick={(e) => selectOption(e)}>Identification</li>
                      <li onClick={(e) => selectOption(e)}>Essay</li>
                    </ul>
                  </div>
                  <label> Assessment Length </label>
                  <div className="dropdown-container">
                    <p>20 questions max</p>
                    <input
                      type="number"
                      className="generic-form-textbox"
                      name={`section-length_${sectionCounter}`}
                      min="1"
                      max="20"
                    />
                  </div>
                  <label> Learning Outcomes: </label>
                  <div
                    className="learning-outcomes"
                    id={`learning-outcomes_${sectionCounter}`}
                  ></div>
                  <button
                    className="generic-button-variant"
                    onClick={() =>
                      addInputElement(`learning-outcomes_${sectionCounter}`)
                    }
                    type="button"
                  >
                    Add Learning Outcome
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    className="custom-file-button"
                    onClick={addNewSection}
                  >
                    Add new section
                  </button>
                  <div id="assessment-section-container">{sections}</div>
                </div>
              )}
            </div>
          </div>
          <div className="submit-form-button">
            <button
              className="generic-button"
              type="submit"
              onClick={handleCreateAssessment}
            >
              {" "}
              Create Assessment{" "}
            </button>
          </div>
        </form>

        <div
          id="promptContainer"
          className="prompt-container"
          style={{ display: "none" }}
        >
          <h1 style={{ marginBottom: "15px" }}> Incomplete Data! </h1>
          <br />
          <br />
          <img src="static/media/error.gif" />
          <p>
            {" "}
            It seems like you have not properly filled-up all of the required
            data to create an assessment just yet.{" "}
          </p>
          <button onClick={closePrompt} className="generic-button-variant">
            Back
          </button>
        </div>
        <div id="overlay" className="overlay"></div>
      </main>
    </div>
  );
};

export default CreateAssessmentPage;
