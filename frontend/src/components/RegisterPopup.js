import React from "react";
import { Link } from "react-router-dom";
import "../styles/styles.css";
import "../styles/tailwind.css";

const RegisterPopup = () => {
  return (
    <div
      className="content-container"
      style={{
        border: "1px solid #8A8A8A",
        borderRadius: "10px",
        padding: "50px",
        backgroundColor: "#FFFFFF",
        position: "fixed",
        top: "30%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        textAlign: "center",
        boxShadow: "inset 0 0 25px #B1B1B1",
      }}
    >
      <div
        className="content-container"
        style={{
          margin: 0,
          flexDirection: "column",
        }}
      >
        <h4>You have successfully registered!</h4>
        <div
          className="content-container"
          style={{
            marginTop: "20px",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <div className="content-left">
            <Link to="/registration" className="nav-interactable">
              <div className="nav-element">←Back </div>
            </Link>
          </div>
          <div className="content-right">
            <Link to="/login" className="nav-interactable">
              <div className="nav-element"> Sign In→ </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPopup;
