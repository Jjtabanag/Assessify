import axios from "axios";
import Logo from "../assets/images/BRAND_LOGO.png";
import { Link } from "react-router-dom";
import "../App.css";

export function Header({ csrfToken, currentUser }) {
  const client = axios.create({
    baseURL: "http://localhost:8000",
  });

  const isLogin = window.location.pathname === "/login";

  const handleSignout = async () => {
    try {
      const response = await client.post("/logout", {
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
      });
      if (response.status === 200) {
        console.log("Logout successful");
      } else {
        console.error("Error logging out");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (currentUser) {
    return (
      <div>
        <nav className="nav-container">
          <div className="navbar-div-left">
            <Link to={"/login"} className="nav-element">
              <div className="nav-element">
                <img src={Logo} height="40" alt="logo" />
              </div>
            </Link>
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
            <Link to={"/login"} className="nav-element">
              <div className="nav-element">
                <img src={Logo} height="40" alt="logo" />
              </div>
            </Link>
            <Link to={"/login"} className="nav-interactable">
              <div className="nav-element"> Pricing </div>
            </Link>
            <Link to={"/login"} className="nav-interactable">
              <div className="nav-element"> About Us </div>
            </Link>
          </div>

          <div className="navbar-div-right">
            <Link
              to={isLogin ? "/registration" : "/login"}
              className="nav-interactable"
            >
              <div className="nav-element">
                {" "}
                {isLogin ? "Sign Up" : "Sign In"}{" "}
              </div>
            </Link>
          </div>
        </nav>
      </div>
    );
  }
}

export default Header;
