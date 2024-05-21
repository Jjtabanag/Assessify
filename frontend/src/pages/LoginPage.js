import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
// import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

const LoginPage = () => {
  const [token, setToken] = useState(''); 
  const [emailorusername, setEmailorUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const client = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true
  });


  const handleLogin = async (event) => {
    event.preventDefault();

    if (emailorusername === '' || password === '') {
      setError('Please fill in all fields');
      return;
    }
        
    const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrftoken')).split('=')[1];
    setToken(csrfToken);

    console.log(csrfToken);
  
    try {
      const response = await client.post('/login', {
        emailorusername: emailorusername,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      });
  
      if (response.status === 202) {
        console.log('Login successful');
        sessionStorage.setItem('token', response.data.token);
        navigate('/home');
      }
    } catch (error) {
      setError(error.response.data.message);
      console.log('Error logging in')
      console.error('Error:', error);
    }
  }
  
  return (
    <>
      <Header csrfToken={token} />
      <main className="content-container">
        <div className="content-left">
        </div>
        <div className="content-right">
          <div className="login-container">
            <h1 align="center"> Sign In </h1>
            <p align="center"> Welcome back! Ready to make assessments with us? <br/> It's so good to have you back for more. </p>
            <br/>

            <form className="navbar-searchbar" onSubmit={handleLogin}>
              <label> Email/Username </label>
              <input className="form-textbox" type="text" name="search" size="70" value={emailorusername} onChange={e => setEmailorUsername(e.target.value)} style={{width: '100%'}}/> <br/><br/>
              <label> Password </label><br/>
              <input className="form-textbox" type="password" name="search" size="70" value={password} onChange={e => setPassword(e.target.value)} style={{width: '100%'}}/>
              <span style={{color: '#FF0000'}}> {error} </span>
              <br/><br/><hr/>
              <p align="center"> Don't have an account yet? <Link to="/registration">Sign up for free.</Link></p>
              <button className="generic-button" type="submit"> Sign In </button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

export default LoginPage