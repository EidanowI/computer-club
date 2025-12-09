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
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  const handleLogoClick = () => {
    navigate('/');
  };

  const handlePhoneEdit = () => {
    if (user) {
      setNewPhone(user.phone);
      setShowPhoneModal(true);
      setPhoneError(null);
    }
  };

  const handlePhoneUpdate = async () => {
    if (!newPhone.trim()) {
      setPhoneError('Номер телефона не может быть пустым');
      return;
    }

    setPhoneLoading(true);
    setPhoneError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/update-phone', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phone: newPhone.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении номера телефона');
      }

      const data = await response.json();
      setUser(data.user);
      setShowPhoneModal(false);
    } catch (error: any) {
      console.error('Ошибка обновления телефона:', error);
      setPhoneError(error.message || 'Ошибка при обновлении номера телефона');
    } finally {
      setPhoneLoading(false);
    }
  };

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

  const handleDeleteProfile = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/delete-profile', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении профиля');
      }

      navigate('/');
      window.location.reload();
    } catch (error: any) {
      console.error('Ошибка удаления профиля:', error);
      alert(error.message || 'Ошибка при удалении профиля');
      setDeleteLoading(false);
      setDeleteConfirm(false);
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
      <img 
        className={styles.logo} 
        src="././public/img/logo.png" 
        alt="Logo" 
        onClick={handleLogoClick}
      />
      
      <div className={styles.profileWrapper}>
        <div className={styles.profileCard}>
          <h1 className={styles.title}>Профиль</h1>
          
          <div className={styles.userInfo}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Логин</div>
              <div className={styles.infoValue}>{user.login}</div>
            </div>
            
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Имя</div>
              <div className={styles.infoValue}>{user.name}</div>
            </div>
            
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Телефон</div>
              <div className={styles.phoneRow}>
                <div className={styles.infoValue}>{user.phone}</div>
                <button 
                  className={styles.editPhoneButton}
                  onClick={handlePhoneEdit}
                  title="Изменить номер телефона"
                >
                  ✏️
                </button>
              </div>
            </div>
            
            {user.isAdmin && (
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Роль</div>
                <div className={`${styles.infoValue} ${styles.adminBadge}`}>
                  Администратор
                </div>
              </div>
            )}
          </div>

          <button 
            className={styles.settingsButton}
            onClick={() => setShowSettingsModal(true)}
          >
            ⚙️ Настройки
          </button>
        </div>
      </div>

      {/* Модальное окно для изменения телефона */}
      {showPhoneModal && (
        <div className={styles.modalOverlay} onClick={() => !phoneLoading && setShowPhoneModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Изменить номер телефона</h2>
            <input
              type="text"
              className={styles.modalInput}
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Введите новый номер телефона"
              disabled={phoneLoading}
            />
            {phoneError && (
              <div className={styles.modalError}>{phoneError}</div>
            )}
            <div className={styles.modalButtons}>
              <button
                className={styles.modalButtonCancel}
                onClick={() => setShowPhoneModal(false)}
                disabled={phoneLoading}
              >
                Отмена
              </button>
              <button
                className={styles.modalButtonConfirm}
                onClick={handlePhoneUpdate}
                disabled={phoneLoading}
              >
                {phoneLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно настроек */}
      {showSettingsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSettingsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Настройки</h2>
            <div className={styles.settingsOptions}>
              <button
                className={styles.settingsOption}
                onClick={handleLogout}
              >
                🚪 Выйти из профиля
              </button>
              <button
                className={`${styles.settingsOption} ${styles.deleteOption}`}
                onClick={handleDeleteProfile}
                disabled={deleteLoading}
              >
                {deleteLoading 
                  ? 'Удаление...' 
                  : deleteConfirm 
                    ? '⚠️ Подтвердить удаление' 
                    : '🗑️ Удалить профиль'
                }
              </button>
            </div>
            <button
              className={styles.modalButtonCancel}
              onClick={() => {
                setShowSettingsModal(false);
                setDeleteConfirm(false);
              }}
              style={{ marginTop: '20px', width: '100%' }}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
