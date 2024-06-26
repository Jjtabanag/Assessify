import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import RegisterPopup from "../components/RegisterPopup";
import UserContext from "../contexts/UserContext";

axios.defaults.withCredentials = true;

const RegistrationPage = () => {
  const [token, setToken] = useState();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [error, setError] = useState("");
  const [openPopup, setOpenPopup] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const client = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
  });

  useEffect(() => {
    if (user.isAuthenticated) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleRegistration = async (event) => {
    event.preventDefault();

    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken"))
      ?.split("=")[1];
    if (!csrfToken) {
      console.log(
        "CSRF token not found. Please refresh the page and try again."
      );
      setError("CSRF token not found. Please try again.");
      return;
    }

    if (
      email === "" ||
      username === "" ||
      password === "" ||
      repassword === ""
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== repassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await client.post(
        "/register",
        {
          username: username,
          email: email,
          password: password,
          repassword: repassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
        }
      );

      if (response.status === 201) {
        // Registration successful, handle accordingly
        setEmail("");
        setUsername("");
        setPassword("");
        setRepassword("");
        setOpenPopup(true);
        console.log("Registration successful");
      }
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        setError(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
        setError("No response from server. Please try again.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <Header csrfToken={token} />
      {openPopup && <RegisterPopup />}
      <main className="content-container">
        <div className="content-left"></div>
        <div className="content-right">
          <div className="register-container">
            <h1 align="center"> Sign Up </h1>
            <p align="center">
              {" "}
              Creating an account is very simple!
              <br />
              Start working with us now!{" "}
            </p>

            <form
              className="navbar-searchbar"
              onSubmit={handleRegistration}
              style={{ width: "100%" }}
            >
              <label> Email </label>
              <br />
              <input
                className="form-textbox"
                type="text"
                placeholder="johndoe123@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%" }}
              />{" "}
              <br />
              <br />
              <label> Username </label>
              <br />
              <input
                className="form-textbox"
                type="text"
                placeholder="John Doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: "100%" }}
              />{" "}
              <br />
              <br />
              <label> Password </label>
              <br />
              <input
                className="form-textbox"
                type="password"
                placeholder="Enter your password."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%" }}
              />{" "}
              <br />
              <br />
              <label> Re-enter Password </label>
              <input
                className="form-textbox"
                type="password"
                placeholder="Re-enter password to confirm password."
                value={repassword}
                onChange={(e) => setRepassword(e.target.value)}
                style={{ width: "100%" }}
              />
              <br />
              <br />
              {error && <span style={{ color: "#FF0000" }}> {error} </span>}
              <hr />
              <p align="center">
                By signing up to our services, you agree to our Terms of Service
                and Privacy Policy.
              </p>
              <button className="generic-button" type="submit">
                Sign Up Now!
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default RegistrationPage;
