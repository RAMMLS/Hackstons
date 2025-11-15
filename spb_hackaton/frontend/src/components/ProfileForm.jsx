import { useState, useEffect } from 'react';
import './ProfileForm.css';

export default function ProfileForm({ onSubmit, isLoading, initialData }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    profession: '',
    interests: '',
    education: '',
    location: '',
    bio: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        age: initialData.age || '',
        profession: initialData.profession || '',
        interests: Array.isArray(initialData.interests) 
          ? initialData.interests.join(', ') 
          : initialData.interests || '',
        education: initialData.education || '',
        location: initialData.location || '',
        bio: initialData.bio || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert interests string to array
    const interestsArray = formData.interests
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    // Validate required fields
    if (!formData.name || !formData.age || !formData.profession || interestsArray.length === 0) {
      alert('Пожалуйста, заполните все обязательные поля: Имя, Возраст, Профессия и хотя бы один Интерес');
      return;
    }

    const profileData = {
      ...formData,
      age: parseInt(formData.age),
      interests: interestsArray
    };

    onSubmit(profileData);
  };

  return (
    <div className="profile-form-container">
      <h2>Расскажите о себе</h2>
      <p className="form-description">
        Заполните информацию о вашем профиле, и наш ИИ создаст персонализированную статью 
        с интересными темами специально для вас!
      </p>
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="name">
            Имя <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Иван Иванов"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age">
              Возраст <span className="required">*</span>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="1"
              max="120"
              placeholder="25"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profession">
              Профессия <span className="required">*</span>
            </label>
            <input
              type="text"
              id="profession"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              required
              placeholder="Программист"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="interests">
            Интересы <span className="required">*</span>
            <span className="hint">(через запятую)</span>
          </label>
          <input
            type="text"
            id="interests"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            required
            placeholder="Технологии, Чтение, Путешествия, Музыка"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="education">Образование</label>
            <input
              type="text"
              id="education"
              name="education"
              value={formData.education}
              onChange={handleChange}
              placeholder="Высшее техническое образование"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Местоположение</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Москва, Россия"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="bio">О себе / Дополнительная информация</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            placeholder="Расскажите больше о себе, своих целях или чем-то еще, чем вы хотели бы поделиться..."
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Анализирую...' : 'Сгенерировать статью'}
        </button>
      </form>
    </div>
  );
}

