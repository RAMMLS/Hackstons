import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EducationalGame.css';

const EducationalGame = ({ onBack }) => {
  const navigate = useNavigate();
  const [mood, setMood] = useState('neutral');
  const [score, setScore] = useState(0);
  const [userName, setUserName] = useState('User123');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const questions = [
    {
      question: "Сколько будет 2 + 2?",
      options: ["3", "4", "5", "6"],
      correct: 1
    },
    {
      question: "Столица Франции?",
      options: ["Лондон", "Берлин", "Париж", "Мадрид"],
      correct: 2
    },
    {
      question: "Какой цвет у неба?",
      options: ["Красный", "Зеленый", "Синий", "Желтый"],
      correct: 2
    }
  ];

  const moods = {
    happy: { image: '/images/animal-happy.png', moodImage: '/images/mood-happy.png' },
    neutral: { image: '/images/animal-neutral.png', moodImage: '/images/mood-neutral.png' },
    sad: { image: '/images/animal-sad.png', moodImage: '/images/mood-sad.png' }
  };

  const handleAnswer = (selectedIndex) => {
    if (selectedIndex === questions[currentQuestion].correct) {
      setScore(score + 10);
      setMood('happy');
    } else {
      setScore(Math.max(0, score - 5));
      setMood('sad');
    }

    // Переход к следующему вопросу
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setMood('neutral');
      } else {
        // Конец игры
        setCurrentQuestion(0);
        setMood('happy');
      }
    }, 1500);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/main');
    }
  };

  const getMoodText = () => {
    switch(mood) {
      case 'happy': return 'Отличное настроение!';
      case 'sad': return 'Нужно подумать...';
      default: return 'Все хорошо!';
    }
  };

  return (
    <div className="educational-game">
      {/* Header */}
      <header className="game-header">
        <button className="back-button" onClick={handleBack}>
          ← Назад
        </button>
        <div className="game-title">Учебная игра</div>
        <div className="user-info">
          <span className="user-name">{userName}</span>
          <div className="rating">Рейтинг: {score}</div>
        </div>
      </header>

      <div className="game-content">
        {/* Левая панель - Полезная информация */}
        <div className="info-panel">
          <h3>Полезная информация</h3>
          <div className="info-content">
            <div className="info-card">
              <h4>Советы по обучению</h4>
              <p>• Регулярно повторяйте материал</p>
              <p>• Делайте перерывы</p>
              <p>• Задавайте вопросы</p>
            </div>
            <div className="info-card">
              <h4>Статистика</h4>
              <p>Правильных ответов: {Math.floor(score / 10)}</p>
              <p>Уровень: {Math.floor(score / 50) + 1}</p>
            </div>
          </div>
        </div>

        {/* Центральная панель - PNG животное и вопросы */}
        <div className="main-panel">
          <div className="animal-section">
            <div className="mood-indicator">
              <img 
                src={moods[mood].moodImage} 
                alt="Настроение" 
                className="mood-image"
              />
              <span className="mood-text">{getMoodText()}</span>
            </div>
            
            <div className="animal-container">
              <img 
                src={moods[mood].image} 
                alt="Обучающее животное" 
                className="animal-image"
              />
            </div>

            <div className="question-section">
              <div className="question-progress">
                Вопрос {currentQuestion + 1} из {questions.length}
              </div>
              <h3 className="question-text">
                {questions[currentQuestion].question}
              </h3>
              
              <div className="options-grid">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className="option-button"
                    onClick={() => handleAnswer(index)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Правая панель - Чат и рейтинг */}
        <div className="chat-panel">
          <div className="chat-header">
            <h3>Чат</h3>
            <button 
              className="chat-toggle"
              onClick={() => setShowChat(!showChat)}
            >
              {showChat ? 'Скрыть' : 'Показать'}
            </button>
          </div>
          
          {showChat && (
            <div className="chat-content">
              <div className="messages">
                <div className="message received">
                  <span className="message-sender">Система:</span>
                  <span className="message-text">Добро пожаловать в игру!</span>
                </div>
                <div className="message sent">
                  <span className="message-sender">Вы:</span>
                  <span className="message-text">Отличная игра!</span>
                </div>
              </div>
              
              <div className="chat-input">
                <input 
                  type="text" 
                  placeholder="Введите сообщение..."
                  className="message-input"
                />
                <button className="send-button">➤</button>
              </div>
            </div>
          )}

          <div className="leaderboard">
            <h4>Рейтинг игроков</h4>
            <div className="leaderboard-list">
              <div className="leaderboard-item current-user">
                <span className="rank">1</span>
                <span className="name">{userName}</span>
                <span className="points">{score} очков</span>
              </div>
              <div className="leaderboard-item">
                <span className="rank">2</span>
                <span className="name">Player2</span>
                <span className="points">85 очков</span>
              </div>
              <div className="leaderboard-item">
                <span className="rank">3</span>
                <span className="name">Player3</span>
                <span className="points">70 очков</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationalGame;

