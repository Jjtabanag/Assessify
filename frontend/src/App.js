import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import CreateAssessment from "./pages/CreateAssessment";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import ViewAssessment from "./pages/ViewAssessment";

import UserContext from "./contexts/UserContext";

function App() {
  const [user, setUser] = useState({
    isAuthenticated: false,
    userData: null,
  });

  // Load the user data from sessionStorage when the component mounts
  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser({
        isAuthenticated: true,
        userData: userData,
      });
    }
  }, []);

  return (
    <Router>
      <div>
        <UserContext.Provider value={{ user, setUser }}>
          <Routes>
            <Route exact path="/" element={<Navigate to="/login" />} />
            <Route path="/home" exact element={<HomePage />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/create-assessment" element={<CreateAssessment />} />
            <Route path="/view-assessment/:id?" element={<ViewAssessment />} />
          </Routes>
        </UserContext.Provider>
      </div>
    </Router>
  );
}

export default App;
