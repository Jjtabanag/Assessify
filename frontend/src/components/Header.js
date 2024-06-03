import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import { useContext } from "react";
import UserContext from "../contexts/UserContext";

export function Header() {
  const client = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true, // Ensure that credentials (cookies) are sent with the request
  });

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

  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const handleSignout = async () => {
    try {
      const csrfToken = getCookie("csrftoken");

      const response = await client.post(
        "/logout",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
        }
      );

      console.log("Logout Response:", response);

      if (response.status === 200) {
        setUser({
          isAuthenticated: false,
          userData: null,
        });
        sessionStorage.removeItem("user");
        navigate("/login");

        console.log("Logged out successfully");
      } else {
        console.error("Error logging out:", response);
        console.error("Error logging out:", response);
      }
    } catch (error) {
      console.error("Error:", error);
    } 
  };

  if (user.isAuthenticated) {
  };

  if (user.isAuthenticated) {
    return (
      <div>
        <nav className="nav-container">
          <div className="navbar-div-left">
            <a href="../index.html" className="web-logo">
              <div className="nav-element">
                <img
                  src="/assets/images/BRAND_LOGO.png"
                  height="40"
                  alt="logo"
                />
              </div>
            </a>
            <a href="../index.html" className="nav-interactable">
              <div className="nav-element"> Pricing </div>
            </a>
            <a href="../index.html" className="nav-interactable">
              <div className="nav-element"> About Us </div>
            </a>
          <div className="navbar-div-left">
            <a href="../index.html" className="web-logo">
              <div className="nav-element">
                <img
                  src="/assets/images/BRAND_LOGO.png"
                  height="40"
                  alt="logo"
                />
              </div>
            </a>
            <a href="../index.html" className="nav-interactable">
              <div className="nav-element"> Pricing </div>
            </a>
            <a href="../index.html" className="nav-interactable">
              <div className="nav-element"> About Us </div>
            </a>
          </div>
          <div className="navbar-div-right">
            <Link
              to="/login"
              className="nav-interactable"
              onClick={handleSignout}
            >
              <div className="nav-element"> Sign Out </div>
            </Link>
          </div>
        </nav>
      </div>
    );
  } else {
    return (
      <div>
        <nav className="nav-container">
          <div className="navbar-div-left">
            <a href="../index.html" className="web-logo">
              <div className="nav-element">
                <img
                  src="assets/images/BRAND_LOGO.png"
                  height="40"
                  alt="logo"
                />
              </div>
            </a>
            <a href="../index.html" className="nav-interactable">
              <div className="nav-element"> Pricing </div>
            </a>
            <a href="../index.html" className="nav-interactable">
              <div className="nav-element"> About Us </div>
            </a>
          </div>

          <div className="navbar-div-right">
            <Link to="/login" className="nav-interactable">
              <div className="nav-element"> Sign In </div>
            </Link>
            <Link to="/login" className="nav-interactable">
              <div className="nav-element"> Sign In </div>
            </Link>
          </div>
        </nav>
      </div>
    );
  }
}

export default Header;

