import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const videoRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    if (!isLogin) {
      // Регистрация - вызываем API
      try {
        const response = await fetch('http://localhost:8000/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });

        if (response.ok) {
          setIsRegistered(true);
          setShowWelcomeVideo(true);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('username', formData.username);
        } else {
          const err = await response.json();
          alert(err.detail || 'Ошибка регистрации');
        }
      } catch (err) {
        console.error(err);
        alert('Не удалось подключиться к серверу');
      }
    } else {
      // Логин - обычная авторизация
      try {
        const response = await fetch('http://localhost:8000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('username', formData.username);
          navigate('/main');
        } else {
          const err = await response.json();
          alert(err.detail || 'Неверный логин или пароль');
        }
      } catch (err) {
        console.error(err);
        alert('Не удалось подключиться к серверу');
      }
    }
  };

  const handleVideoEnd = () => {
    setShowWelcomeVideo(false);
    // После видео переходим на главную страницу
    navigate('/main');
  };

  const handleCloseVideo = () => {
    setShowWelcomeVideo(false);
    videoRef.current?.pause();
    navigate('/main');
  };

  if (showWelcomeVideo) {
    return (
      <div className="video-overlay">
        <div className="video-container">
          <button className="close-video-btn" onClick={handleCloseVideo}>
            ×
          </button>
          <video
            ref={videoRef}
            autoPlay
            muted
            onEnded={handleVideoEnd}
            className="welcome-video"
          >
            <source src="/videos/welcome-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-text">
            <h2>Добро пожаловать, {formData.username}!</h2>
            <p>Ваша регистрация завершена успешно</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? 'Login' : 'Register'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Имя пользователя"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-button">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              className="switch-link" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Register' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

