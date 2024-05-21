import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AddAssessmentSettingsPage from './pages/AddAssessmentSettingsPage';
import AddLessonPage from './pages/AddLessonPage';
import CreateAssessment from './pages/CreateAssessment';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ViewAssessmentsPage from './pages/ViewAssessmentsPage';

function App() {

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/home" exact element={<ViewAssessmentsPage />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage currentUser/>} />
          <Route path="/create-assessment" element={<CreateAssessment />} />
          <Route path="/add-lesson" element={<AddLessonPage />} />
          <Route path="/add-assessment-settings" element={<AddAssessmentSettingsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;