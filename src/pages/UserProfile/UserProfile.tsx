import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserProfile.module.css';

interface User {
  id: number;
  login: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  adminPosition?: string | null;
}

interface Order {
  id: number;
  date: string;
  time: string;
  minute_count: number;
  description: string;
  minute_cost: number;
  total_cost: number;
  user_login?: string;
  user_name?: string;
}

interface AdminOrdersByDate {
  orders: Order[];
  totalSum: string;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [adminOrders, setAdminOrders] = useState<AdminOrdersByDate | null>(null);
  const [adminOrdersLoading, setAdminOrdersLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      // Для админа загружаем заказы за выбранную дату
      if (user.isAdmin) {
        setAdminOrdersLoading(true);
        try {
          const response = await fetch(
            `http://localhost:5000/api/orders/by-date?date=${selectedDate}`,
            {
              credentials: 'include'
            }
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const jsonData = await response.json();
          setAdminOrders({
            orders: jsonData.orders || [],
            totalSum: jsonData.totalSum || '0.00'
          });
        } catch (err) {
          console.error('Ошибка получения заказов за дату:', err);
          setAdminOrders({ orders: [], totalSum: '0.00' });
        } finally {
          setAdminOrdersLoading(false);
        }
      } else {
        // Для обычного пользователя загружаем его заказы
        try {
          const response = await fetch('http://localhost:5000/api/orders/my-orders', {
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const jsonData = await response.json();
          setOrders(jsonData.orders || []);
        } catch (err) {
          console.error('Ошибка получения заказов:', err);
          setOrders([]);
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, selectedDate]);

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

  // Определение статуса заказа: 'past' - прошёл, 'active' - идёт, 'future' - не наступил
  const getOrderStatus = (order: Order): 'past' | 'active' | 'future' => {
    const now = new Date();
    // Нормализуем дату заказа (убираем время, если есть)
    const orderDateStr = String(order.date);
    const orderDate = orderDateStr.includes('T') ? orderDateStr.split('T')[0] : orderDateStr.split(' ')[0];
    const today = now.toISOString().split('T')[0];
    
    // Преобразуем текущее время в минуты (от начала дня)
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Вычисляем время начала и окончания заказа в минутах (от начала дня)
    // Время может быть в формате HH:MM:SS или HH:MM
    const timeStr = String(order.time);
    const timeParts = timeStr.split(':');
    const orderHours = parseInt(timeParts[0], 10);
    const orderMinutes = parseInt(timeParts[1], 10);
    const orderStartMinutes = orderHours * 60 + orderMinutes;
    
    // Убеждаемся, что minute_count - это число
    const minuteCount = typeof order.minute_count === 'number' 
      ? order.minute_count 
      : parseInt(String(order.minute_count), 10);
    const orderEndMinutes = orderStartMinutes + minuteCount;
    
    // Максимальное количество минут в дне (23:59 = 1439 минут)
    const maxMinutesInDay = 24 * 60 - 1;
    
    if (orderDate < today) {
      return 'past'; // Заказ прошёл
    } else if (orderDate > today) {
      return 'future'; // Заказ ещё не наступил
    } else {
      // Сегодня - проверяем время в минутах
      // Если заказ переходит через полночь (orderEndMinutes > maxMinutesInDay),
      // то считаем, что он заканчивается в 23:59
      const actualOrderEndMinutes = Math.min(orderEndMinutes, maxMinutesInDay);
      
      // Проверяем статус: сначала проверяем, не закончился ли заказ
      if (currentMinutes >= actualOrderEndMinutes) {
        return 'past'; // Заказ уже закончился сегодня
      } 
      // Затем проверяем, начался ли заказ
      if (currentMinutes >= orderStartMinutes) {
        return 'active'; // Заказ идёт сейчас
      }
      // Иначе заказ ещё не начался
      return 'future'; // Заказ начнётся позже сегодня
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
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
      
      <div className={styles.contentWrapper}>
        {/* Список заказов слева */}
        <div className={styles.ordersSection}>
          <h2 className={styles.ordersTitle}>
            {user.isAdmin ? 'Все заказы' : 'Мои заказы'}
          </h2>
          
          {user.isAdmin && (
            <div className={styles.dateSelector}>
              <label className={styles.dateLabel}>Выбор даты:</label>
              <input
                type="date"
                className={styles.dateInput}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          {user.isAdmin ? (
            <>
              {adminOrdersLoading ? (
                <div className={styles.ordersLoading}>Загрузка заказов...</div>
              ) : adminOrders && adminOrders.orders.length === 0 ? (
                <div className={styles.noOrders}>Заказов за выбранную дату нет</div>
              ) : adminOrders ? (
                <>
                  <div className={styles.totalSumContainer}>
                    <div className={styles.totalSumLabel}>Общая сумма за день:</div>
                    <div className={styles.totalSumValue}>{adminOrders.totalSum} руб.</div>
                  </div>
                  <div className={styles.ordersList}>
                    {adminOrders.orders.map((order) => {
                      const status = getOrderStatus(order);
                      return (
                        <div 
                          key={order.id} 
                          className={`${styles.orderCard} ${styles['orderCard_' + status]}`}
                        >
                          <div className={styles.orderHeader}>
                            <div className={styles.orderDate}>{formatDate(order.date)}</div>
                            <div className={styles.orderTime}>{order.time}</div>
                          </div>
                          {order.user_login && (
                            <div className={styles.orderUser}>
                              <span className={styles.orderUserLabel}>Пользователь:</span>
                              <span className={styles.orderUserValue}>
                                {order.user_name} ({order.user_login})
                              </span>
                            </div>
                          )}
                          <div className={styles.orderDescription}>{order.description}</div>
                          <div className={styles.orderDetails}>
                            <div className={styles.orderMinutes}>{order.minute_count} мин.</div>
                            <div className={styles.orderCost}>{parseFloat(String(order.total_cost)).toFixed(2)} руб.</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <>
              {ordersLoading ? (
                <div className={styles.ordersLoading}>Загрузка заказов...</div>
              ) : orders.length === 0 ? (
                <div className={styles.noOrders}>У вас пока нет заказов</div>
              ) : (
                <div className={styles.ordersList}>
                  {orders.map((order) => {
                    const status = getOrderStatus(order);
                    return (
                      <div 
                        key={order.id} 
                        className={`${styles.orderCard} ${styles['orderCard_' + status]}`}
                      >
                        <div className={styles.orderHeader}>
                          <div className={styles.orderDate}>{formatDate(order.date)}</div>
                          <div className={styles.orderTime}>{order.time}</div>
                        </div>
                        <div className={styles.orderDescription}>{order.description}</div>
                        <div className={styles.orderDetails}>
                          <div className={styles.orderMinutes}>{order.minute_count} мин.</div>
                          <div className={styles.orderCost}>{parseFloat(String(order.total_cost)).toFixed(2)} руб.</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Профиль справа */}
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
                  {user.adminPosition || 'Администратор'}
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
