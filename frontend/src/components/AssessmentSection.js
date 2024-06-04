import React, { useState } from "react";

function AssessmentSection({ sectionCounter }) {
  const [selectedOption, setSelectedOption] = useState("");

  const toggleDropdown = (event) => {
    const dropdownOptions = event.target.nextElementSibling;
    dropdownOptions.style.display =
      dropdownOptions.style.display === "block" ? "none" : "block";
  };

  const selectOption = (e) => {
    const option = e.target.textContent;
    setSelectedOption(option);
    e.target.parentNode.style.display = "none";
  };

  var learningOutcomeCounter = 0;
  function addInputElement(containerID) {
    learningOutcomeCounter++;
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

  return (
    <div>
      <h2 className="exam-part"> Section {sectionCounter} </h2>
      <br></br>
      <label> Assessment Type </label>
      <div className="dropdown-container">
        <input
          type="text"
          className="generic-form-textbox"
          placeholder="Select an option"
          onClick={toggleDropdown} // React will pass the event object
          name={`section-type_${sectionCounter}`}
          value={selectedOption}
          readOnly
        />
        <ul className="dropdown-options">
          <li onClick={(e) => selectOption(e)}>Multiple Choice</li>
          <li onClick={(e) => selectOption(e)}>True or False</li>
          <li onClick={(e) => selectOption(e)}>Fill in The Blanks</li>
          <li onClick={(e) => selectOption(e)}>Identification</li>
          <li onClick={(e) => selectOption(e)}>Essay</li>
        </ul>
      </div>

      <label> Assessment Length </label>
      <div className="dropdown-container">
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
        onClick={() => addInputElement(`learning-outcomes_${sectionCounter}`)}
        type="button"
      >
        {" "}
        Add Learning Outcome{" "}
      </button>
    </div>
  );
}

export default AssessmentSection;
