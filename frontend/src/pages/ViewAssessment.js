import { useEffect, useState, useContext } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import UserContext from "../contexts/UserContext";

const ViewAssessment = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const action = query.get("action");

  const navigate = useNavigate();
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [assessmentData, setAssessmentData] = useState([]);
  const [token, setToken] = useState("");

  const { user } = useContext(UserContext);

  const client = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
  });

  useEffect(() => {
    const fetchAssessmentData = async () => {
      const tk = sessionStorage.getItem("token");
      console.log("token:", tk);
      setToken(tk);
      if (!tk) {
        console.error("Login required");
        navigate("/login");
        return;
      }

      try {
        console.log(id);

        const response = await client.get(`/view_assessment/${id}`, {
          headers: {
            Authorization: tk,
          },
        });

        console.log("Assessment data:", response.data);

        setAssessment(response.data.assessment);
        setAssessmentData(response.data.assessment_data);
      } catch (error) {
        console.error("Error fetching assessment data:", error);
      }
    };

    fetchAssessmentData();
  }, [id]);

  useEffect(() => {
    if (!user.isAuthenticated) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const tk = sessionStorage.getItem("token");
    console.log("token:", tk);
    setToken(tk);
    if (!tk) {
      console.error("Login required");
      navigate("/login");
      return;
    }

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

    try {
      const response = await client.post(`/view_assessment/${id}`, formData, {
        headers: {
          Authorization: tk,
          "X-CSRFToken": token,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Assessment saved:", response.data);
      // Handle success, e.g., show a success message or redirect
    } catch (error) {
      console.error("Error saving assessment:", error);
      // Handle error, e.g., show an error message
    }
  };

  return (
    <>
      <Header csrfToken={token} />
      <main
        className="generic-content-container"
        style={{ marginTop: "100px" }}
      >
        <div className="content-grid">
          {action === "view" ? (
            <div className="assessment-container">
              <div className="assessment-section">
                <h1> {assessment?.name} </h1>
                <h4>Description: </h4>
                <p> {assessment?.description} </p>
                {assessmentData.map(({ section, questions }) => (
                  <div key={section.id}>
                    <h2>
                      {" "}
                      {section.name
                        ? section.name
                        : `Section ${section.type}`}{" "}
                    </h2>
                    <ol className="choiced-items" type="1">
                      {questions.map((question) => (
                        <li className="item" key={question.question_no}>
                          {question.question} <br />
                          {question.options &&
                            question.options.map((option, index) => (
                              <div key={index}>
                                {String.fromCharCode(65 + index)}.{" "}
                                {option.option}
                              </div>
                            ))}
                          {question.answer !== null && (
                            <>
                              <br />
                              <b className="answer">
                                {" "}
                                Answer:{" "}
                                {String.fromCharCode(
                                  65 + parseInt(question.answer)
                                )}{" "}
                              </b>
                            </>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
              <br />
              <br />
              <h3>
                <a href={`/export-assessment?as=${id}&ff=pdf`}>
                  {" "}
                  EXPORT (to PDF){" "}
                </a>
                <a
                  href={`/export-assessment?as=${id}&ff=word`}
                  style={{ paddingLeft: "100px" }}
                >
                  {" "}
                  EXPORT (to WORD){" "}
                </a>
                <a
                  href={`/export-assessment?as=${id}&ff=gift`}
                  style={{ paddingLeft: "100px" }}
                >
                  {" "}
                  EXPORT (to GIFT){" "}
                </a>
                <a
                  href={`/view-assessment/${id}?action=edit`}
                  style={{ paddingLeft: "100px" }}
                >
                  {" "}
                  EDIT{" "}
                </a>
              </h3>
            </div>
          ) : (
            <form
              className="container-form"
              method="post"
              onSubmit={handleSubmit}
            >
              <div className="assessment-container">
                <label> Assessment Name: </label>
                <input
                  className="generic-form-textbox"
                  type="text"
                  //name={`assessmentname_${assessment.pk}`}
                  defaultValue={assessment?.name}
                />
                <label> Description: </label>
                <input
                  className="generic-form-textbox"
                  type="text"
                  name={`assessmentdescription_${id}`}
                  defaultValue={assessment?.description}
                />
                <br />
                <br />
                <div className="content-grid">
                  <div className="assessment-section">
                    {assessmentData.map(({ section, questions }) => (
                      <div key={section.id}>
                        <br />
                        <br />
                        <label> Section Name: </label>
                        <input
                          className="generic-form-textbox"
                          type="text"
                          name={`sectionname_${section.pk}`}
                          defaultValue={section.name}
                        />
                        <label> Description:</label>
                        <input
                          className="generic-form-textbox"
                          type="text"
                          name={`sectiondescription_${section.pk}`}
                          defaultValue={section.description}
                        />
                        {section.type}
                        <ol className="choiced-items" type="1">
                          {questions.map((question) => (
                            <li className="item" key={question.question_no}>
                              <label>Question</label>
                              <input
                                className="generic-form-textbox"
                                type="text"
                                name={`question_${question.pk}`}
                                defaultValue={question.question}
                              />
                              {question.type === "Multiple Choice" ? (
                                <>
                                  <label>Answer</label>
                                  <input
                                    className="generic-form-textbox"
                                    type="text"
                                    name={`answerwc_${question.pk}`}
                                    defaultValue={question.answer}
                                  />
                                  <ol className="options" type="A">
                                    {question.options &&
                                      question.options.map((option, index) => (
                                        <li key={index}>
                                          <input
                                            className="generic-form-textbox"
                                            type="text"
                                            name={`option_${option.pk}`}
                                            defaultValue={option.option}
                                          />
                                        </li>
                                      ))}
                                  </ol>
                                </>
                              ) : (
                                <>
                                  <label>Answer</label>
                                  <input
                                    className="generic-form-textbox"
                                    type="text"
                                    name={`answer_${question.pk}`}
                                    defaultValue={question.answer || ""}
                                  />
                                </>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="generic-button" type="submit">
                  {" "}
                  Save{" "}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default ViewAssessment;
