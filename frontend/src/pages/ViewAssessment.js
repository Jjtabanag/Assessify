import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
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

        setAssessment(response.data.assessment);
        setAssessmentData(response.data.assessment_data);
      } catch (error) {
        console.error("Error fetching assessment data:", error);
      }
    };
    console.log("Assessment Data: ", assessmentData);
    fetchAssessmentData();
  }, [id, action]);

  useEffect(() => {
    if (!user.isAuthenticated) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    for (let pair of formData.entries()) {
      console.log("FormData: " + pair[0] + ", " + pair[1]);
    }

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
      navigate(`/view-assessment/${id}?action=view`);
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
                      {section.name
                        ? section.name
                        : `Section ${section.section_no}`}
                    </h2>
                    <ol className="choiced-items" type="1">
                      {questions.map((question) => (
                        <li
                          className="item"
                          key={question.id}
                          style={{ marginBottom: "20px" }}
                        >
                          {question.question} <br></br>
                          {question.options &&
                            question.options.map((option) => (
                              <div key={option.id}>
                                <br></br>
                                {String.fromCharCode(
                                  65 + option.option_no
                                )}. {option.option}
                                <br></br>
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
                <Link
                  to={`/view-assessment/${id}?action=edit`}
                  style={{ marginLeft: "100px" }}
                  className="generic-button-export"
                >
                  {" "}
                  EDIT{" "}
                </Link>
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
                  className="generic-form-textbox-1"
                  type="text"
                  name={`assessmentname_${assessment.id}`}
                  defaultValue={assessment?.name}
                />
                <label> Description: </label>
                <input
                  className="generic-form-textbox-1"
                  type="text"
                  name={`assessmentdescription_${assessment.id}`}
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
                          className="generic-form-textbox-1"
                          type="text"
                          name={`sectionname_${section.id}_${section.section_no}`}
                          defaultValue={section.section_name}
                        />
                        <label> Description:</label>
                        <input
                          className="generic-form-textbox-1"
                          type="text"
                          name={`sectiondescription_${section.id}_${section.section_no}`}
                          defaultValue={section.description}
                        />
                        <ol className="choiced-items" type="1">
                          {questions.map((question) => (
                            <li className="item" key={question.id}>
                              <label>Question</label>
                              <input
                                className="generic-form-textbox-1"
                                type="text"
                                name={`question_${question.id}_${question.question_no}`}
                                defaultValue={question.question}
                              />
                              <ol type="A">
                                {question.options &&
                                  question.options.map((option) => (
                                    <li className="option" key={option.id}>
                                      <label>Option</label>
                                      <input
                                        className="generic-form-textbox"
                                        type="text"
                                        name={`option_${option.id}_${option.option_no}`}
                                        defaultValue={option.option}
                                      />
                                    </li>
                                  ))}
                              </ol>
                              <br />
                              {question.type === "Multiple Choice" ? (
                                <>
                                  <label>Answer</label>
                                  <input
                                    className="generic-form-textbox-1"
                                    type="text"
                                    name={`answerwc_${question.pk}`}
                                    defaultValue={question.answer}
                                  />
                                  <ol className="options" type="A">
                                    {question.options &&
                                      question.options.map((option, index) => (
                                        <li key={index}>
                                          <input
                                            className="generic-form-textbox-1"
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
                                    className="generic-form-textbox-1"
                                    type="text"
                                    name={`answer_${question.id}`}
                                    defaultValue={question.answer}
                                    style={{ marginBottom: "20px" }}
                                  />
                                  <br />
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
              <button
                className="generic-button-variant-2"
                onClick={() =>
                  navigate(`/view-assessment/${assessment.id}?action=view`)
                }
                style={{
                  height: "60px",
                  width: "350px",
                  display: "block",
                  margin: "20px auto auto auto",
                }}
              >
                Back
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default ViewAssessment;
