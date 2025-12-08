import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserProfile.module.css';

interface User {
  id: number;
  login: string;
  name: string;
  phone: string;
  isAdmin: boolean;
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        if (jsonData.user) {
          setUser(jsonData.user);
        } else {
          // Если пользователь не авторизован, перенаправляем на главную
          navigate('/');
        }
      } catch (err) {
        console.error('Ошибка получения пользователя:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        navigate('/');
        window.location.reload();
      }
    } catch (err) {
      console.error('Ошибка выхода:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <h1 className={styles.title}>Профиль пользователя</h1>
        
        <div className={styles.userInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Логин:</span>
            <span className={styles.value}>{user.login}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Имя:</span>
            <span className={styles.value}>{user.name}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Телефон:</span>
            <span className={styles.value}>{user.phone}</span>
          </div>
          {user.isAdmin && (
            <div className={styles.infoRow}>
              <span className={styles.label}>Роль:</span>
              <span className={styles.value}>Администратор</span>
            </div>
          )}
        </div>

        <div className={styles.buttonsContainer}>
          <button className={styles.homeButton} onClick={() => navigate('/')}>
            Домой
          </button>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}

