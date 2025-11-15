import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from '../components/ProfileForm';
import './Profile.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/profile/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      } else if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('isAuthenticated');
        navigate('/auth');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Не удалось загрузить профиль');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (profileData) => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/profile/me`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else if (response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('isAuthenticated');
        navigate('/auth');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Ошибка при сохранении профиля');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Не удалось сохранить профиль');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading-message">Загрузка профиля...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <button className="back-button" onClick={() => navigate('/main')}>
            ← Назад
          </button>
          <h1>Мой профиль</h1>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            Профиль успешно сохранен!
          </div>
        )}

        <ProfileForm 
          onSubmit={handleProfileSubmit} 
          isLoading={isSaving}
          initialData={profile}
        />
      </div>
    </div>
  );
}

