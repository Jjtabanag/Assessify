import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";

import UserContext from "../contexts/UserContext";

const LoginPage = () => {
  const [token, setToken] = useState("");
  const [emailorusername, setEmailorUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { user, setUser } = useContext(UserContext);

  const { user, setUser } = useContext(UserContext);

  const client = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
    baseURL: "http://localhost:8000",
    withCredentials: true,
  });

  useEffect(() => {
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken"))
      ?.split("=")[1];
    if (csrfToken) {
      setToken(csrfToken);
    } else {
      setError("CSRF token not found. Please refresh the page and try again.");
    }
  }, []);

  useEffect(() => {
    if (user.isAuthenticated) {
      navigate("/home");
    }
  }, [user, navigate]);
  useEffect(() => {
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken"))
      ?.split("=")[1];
    if (csrfToken) {
      setToken(csrfToken);
    } else {
      setError("CSRF token not found. Please refresh the page and try again.");
    }
  }, []);

  useEffect(() => {
    if (user.isAuthenticated) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (emailorusername === "" || password === "") {
      setError("Please fill in all fields");
    if (emailorusername === "" || password === "") {
      setError("Please fill in all fields");
      return;
    }

    if (!token) {
      setError("CSRF token not found. Please try again.");
      return;
    }


    if (!token) {
      setError("CSRF token not found. Please try again.");
      return;
    }

    try {
      const response = await client.post(
        "/login",
        {
          emailorusername: emailorusername,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
      const response = await client.post(
        "/login",
        {
          emailorusername: emailorusername,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": token,
          },
        }
      );

      );

      if (response.status === 202) {
        console.log("Login successful");
        setUser({ isAuthenticated: true, userData: response.data.user });
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
        sessionStorage.setItem("token", response.data.token);
        navigate("/home");
        console.log("Login successful");
        setUser({ isAuthenticated: true, userData: response.data.user });
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
        sessionStorage.setItem("token", response.data.token);
        navigate("/home");
      }
    } catch (error) {
      setError(error.response.data.message);
      console.log("Error logging in");
      console.error("Error:", error);
      console.log("Error logging in");
      console.error("Error:", error);
    }
  };

  };

  return (
    <>
      <Header csrfToken={token} />
      <main className="content-container">
        <div className="content-left"></div>
        <div className="content-left"></div>
        <div className="content-right">
          <div className="login-container">
            <h1 align="center"> Sign In </h1>
            <p align="center">
              {" "}
              Welcome back! Ready to make assessments with us? <br /> It's so
              good to have you back for more.{" "}
            </p>
            <br />
            <p align="center">
              {" "}
              Welcome back! Ready to make assessments with us? <br /> It's so
              good to have you back for more.{" "}
            </p>
            <br />

            <form className="navbar-searchbar" onSubmit={handleLogin}>
              <label> Email/Username </label>
              <input
                className="form-textbox"
                type="text"
                name="search"
                size="70"
                value={emailorusername}
                onChange={(e) => setEmailorUsername(e.target.value)}
                style={{ width: "100%" }}
              />{" "}
              <br />
              <br />
              <label> Password </label>
              <br />
              <input
                className="form-textbox"
                type="password"
                name="search"
                size="70"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%" }}
              />
              <span style={{ color: "#FF0000" }}> {error} </span>
              <br />
              <br />
              <hr />
              <p align="center">
                {" "}
                Don't have an account yet?{" "}
                <Link to="/registration">Sign up for free.</Link>
              </p>
              <button className="generic-button" type="submit">
                {" "}
                Sign In{" "}
              </button>
              <input
                className="form-textbox"
                type="text"
                name="search"
                size="70"
                value={emailorusername}
                onChange={(e) => setEmailorUsername(e.target.value)}
                style={{ width: "100%" }}
              />{" "}
              <br />
              <br />
              <label> Password </label>
              <br />
              <input
                className="form-textbox"
                type="password"
                name="search"
                size="70"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%" }}
              />
              <span style={{ color: "#FF0000" }}> {error} </span>
              <br />
              <br />
              <hr />
              <p align="center">
                {" "}
                Don't have an account yet?{" "}
                <Link to="/registration">Sign up for free.</Link>
              </p>
              <button className="generic-button" type="submit">
                {" "}
                Sign In{" "}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};
  );
};

export default LoginPage;

export default LoginPage;
