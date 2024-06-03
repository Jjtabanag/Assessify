import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import CreateAssessment from "./pages/CreateAssessment";
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import HomePage from "./pages/HomePage";
import ViewAssessment from "./pages/ViewAssessment";
import { useEffect, useState } from "react";

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
            <Route path="/login" element={<LoginPage currentUser />} />
            <Route path="/create-assessment" element={<CreateAssessment />} />
            <Route path="/view-assessment/:id" element={<ViewAssessment />} />
          </Routes>
        </UserContext.Provider>
      </div>
    </Router>
  );
}

export default App;
