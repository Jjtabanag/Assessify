import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CreateAssessmentPopup from '../components/CreateAssessmentPopup';
import Header from '../components/Header';

const ViewAssessmentsPage = () => {
  const [token, setToken] = useState();
  const [username, setUsername] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [openCreatePrompt, setOpenCreatePrompt] = useState(false);

  const client = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessments = async () => {
      const tk = sessionStorage.getItem('token');
      console.log('token:', tk)
      setToken(tk);
      if (!tk) {
        console.error('Login required');
        navigate('/login');
        return;
      }

      try {
        const response = await client.get('/assessments', {
          headers: {
            'Authorization': tk
          }
        });
        console.log(response.data);
        setUsername(response.data.username)
        setAssessments(response.data.assessments);
      } catch (error) {
        console.error('Error fetching assessments:', error);
        navigate('/login');
      }
    };

    fetchAssessments();
  }, []);

  const toggleCreatePrompt = () => {
    setOpenCreatePrompt(!openCreatePrompt);
  };

  return (
    <>
    <Header csrfToken={token} currentUser={username}/>
    {openCreatePrompt && <CreateAssessmentPopup toggleCreatePrompt={toggleCreatePrompt}/>}
    <div className="generic-content-container">
        <br/><br/><br/>
        <h1> My Assessments </h1>
        <p> Welcome back, {username}! Here are the assessments you have created since you've joined us! </p> <br/><br/>
        <div class="assessment-grid-container">
          <div class="assessment-box">
            <div class="assessment-description">
              <h2> Sample Quiz Assessment 1 </h2>
              <p> Quiz Type | 10 Items | Dec. 01, 2023 </p>
              <p> This is a sample quiz assessment with a sample description. Feel free to add descriptions to your assessments to help you keep track of things. </p>
            </div>
          </div>

          <div class="assessment-box">
            <div class="assessment-description">
              <h2> Sample Examination Assessment 2 </h2>
              <p> Exam Type | 20 Items - 2 Parts </p>
              <p> This is a sample assessment with a sample description. </p>
            </div>
          </div>

          <Link onClick={() => setOpenCreatePrompt(true)} className="assessment-create-box">
            <img src="../assets/images/add.png" height="150" width="165" alt='add button'/>
            <h2> Create New <br/> Assessment </h2>
          </Link>
        </div>
    </div>
    </>
  )
}

export default ViewAssessmentsPage