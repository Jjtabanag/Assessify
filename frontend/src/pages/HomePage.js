import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CreateAssessmentPopup from "../components/CreateAssessmentPopup";
import Header from "../components/Header";
import UserContext from "../contexts/UserContext";

const ViewAssessmentsPage = () => {
  const [token, setToken] = useState();
  const [username, setUsername] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [openCreatePrompt, setOpenCreatePrompt] = useState(false);
  const { user } = useContext(UserContext);

  const client = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!user.isAuthenticated) {
      console.error("Login required");
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchAssessments = async () => {
      const tk = sessionStorage.getItem("token");
      console.log("token:", tk);
      setToken(tk);
      if (!tk) {
        console.error("Login required");
        navigate("/login");
        return;
      }

      try {
        const response = await client.get("/assessments", {
          headers: {
            Authorization: tk,
          },
        });

        const assessmentsArray = JSON.parse(response.data.assessments);

        console.log("Assessments:", assessmentsArray);

        setAssessments(assessmentsArray);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      }
    };

    fetchAssessments();
  }, []);

  const toggleCreatePrompt = () => {
    console.log("Toggling create prompt. Current state:", openCreatePrompt);
    setOpenCreatePrompt(!openCreatePrompt);
  };

  return (
    <>
      <Header />
      {openCreatePrompt && (
        <CreateAssessmentPopup toggleCreatePrompt={toggleCreatePrompt} />
      )}
      <div className="generic-content-container">
        <br />
        <br />
        <br />
        <h1> My Assessments </h1>
        <p>
          Welcome back, {username}! Here are the assessments you have created
          since you've joined us!
        </p>
        <br />
        <br />
        <div className="assessment-grid-container">
          {assessments.map((assessment, index) => (
            <Link
              key={index}
              to={`/view-assessment/${assessment.pk}?action=view`}
              className="assessment-box"
            >
              <div className="assessment-description">
                <h2>{assessment.fields.name}</h2>
                <p>
                  {assessment.fields.type} | {assessment.fields.no_of_questions}{" "}
                  Items
                </p>
                <p>{assessment.fields.description}</p>
                <p>Date Created: {assessment.fields.date_created}</p>
              </div>
            </Link>
          ))}
          <Link
            onClick={() => {
              console.log("Create new assessment clicked");
              setOpenCreatePrompt(true);
            }}
            className="assessment-create-box"
          >
            <img
              src="/assets/images/dwafawf.png"
              height="150"
              width="165"
              alt="add button"
            />
            <h2>
              Create New <br /> Assessment
            </h2>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ViewAssessmentsPage;
