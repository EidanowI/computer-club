import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./Order.module.css";
import NotificationModal from '../../components/NotificationModal/NotificationModal';

export default function Order() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  
  // Функция для получения текущего времени в формате HH:MM
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Функция для получения времени + 1 час в формате HH:MM
  const getTimePlusOneHour = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [selectedDate, setSelectedDate] = useState(today);
  const [timeFrom, setTimeFrom] = useState(getCurrentTime());
  const [timeTo, setTimeTo] = useState(getTimePlusOneHour());
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData = await response.json();
        if (jsonData.user) {
          setIsAuthorized(true);
        } else {
          setShowNotification(true);
        }
      } catch (err) {
        console.error('Ошибка проверки авторизации:', err);
        setShowNotification(true);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleNotificationClose = () => {
    setShowNotification(false);
    navigate('/');
  };

  const calculateMinutes = () => {
    if (!timeFrom || !timeTo) return 0;
    
    const [fromHours, fromMinutes] = timeFrom.split(':').map(Number);
    const [toHours, toMinutes] = timeTo.split(':').map(Number);
    
    const fromTotalMinutes = fromHours * 60 + fromMinutes;
    const toTotalMinutes = toHours * 60 + toMinutes;
    
    const difference = toTotalMinutes - fromTotalMinutes;
    return difference > 0 ? difference : 0;
  };

  const isValidTimeRange = () => {
    if (!timeFrom || !timeTo) return false;
    
    const [fromHours, fromMinutes] = timeFrom.split(':').map(Number);
    const [toHours, toMinutes] = timeTo.split(':').map(Number);
    
    const fromTotalMinutes = fromHours * 60 + fromMinutes;
    const toTotalMinutes = toHours * 60 + toMinutes;
    
    return toTotalMinutes > fromTotalMinutes;
  };

  const handleTimeFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeFrom = e.target.value;
    setTimeFrom(newTimeFrom);
    
    // Проверяем, что время "до" все еще больше нового времени "от"
    if (newTimeFrom && timeTo) {
      const [fromHours, fromMinutes] = newTimeFrom.split(':').map(Number);
      const [toHours, toMinutes] = timeTo.split(':').map(Number);
      
      const fromTotalMinutes = fromHours * 60 + fromMinutes;
      const toTotalMinutes = toHours * 60 + toMinutes;
      
      // Если время "до" меньше или равно времени "от", увеличиваем его на 1 минуту
      if (toTotalMinutes <= fromTotalMinutes) {
        const newToTotalMinutes = fromTotalMinutes + 1;
        const newToHours = Math.floor(newToTotalMinutes / 60);
        const newToMins = newToTotalMinutes % 60;
        const newTimeTo = `${String(newToHours).padStart(2, '0')}:${String(newToMins).padStart(2, '0')}`;
        setTimeTo(newTimeTo);
      }
    }
  };

  const handleTimeToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeTo = e.target.value;
    
    if (!timeFrom || !newTimeTo) {
      setTimeTo(newTimeTo);
      return;
    }
    
    const [fromHours, fromMinutes] = timeFrom.split(':').map(Number);
    const [toHours, toMinutes] = newTimeTo.split(':').map(Number);
    
    const fromTotalMinutes = fromHours * 60 + fromMinutes;
    const toTotalMinutes = toHours * 60 + toMinutes;
    
    // Если время "до" меньше или равно времени "от", не применяем изменение
    if (toTotalMinutes > fromTotalMinutes) {
      setTimeTo(newTimeTo);
    }
  };

  const totalMinutes = calculateMinutes();
  const isValid = isValidTimeRange();

  if (loading) {
    return (
      <div className={styles.order_container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <>
        <NotificationModal
          isOpen={showNotification}
          message="Для оформления заказа необходимо войти в систему"
          onClose={handleNotificationClose}
        />
      </>
    );
  }

  return (
    <div className={styles.order_container}>
      <img 
        className={styles.order_logo} 
        src="././public/img/logo.png" 
        alt="Logo" 
        onClick={handleLogoClick}
      />
      <h1 className={styles.order_title}>Оформление заказа</h1>
      <div className={styles.order_date_container}>
        <label className={styles.order_date_label}>Выбор даты</label>
        <input 
          type="date" 
          className={styles.order_date_input}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={today}
        />
      </div>
      <div className={styles.order_time_container}>
        <div className={styles.order_time_group}>
          <label className={styles.order_time_label}>Время от</label>
          <input 
            type="time" 
            className={styles.order_time_input}
            value={timeFrom}
            onChange={handleTimeFromChange}
          />
        </div>
        <div className={styles.order_time_group}>
          <label className={styles.order_time_label}>Время до</label>
          <input 
            type="time" 
            className={`${styles.order_time_input} ${!isValid ? styles.order_time_input_error : ''}`}
            value={timeTo}
            onChange={handleTimeToChange}
            min={timeFrom}
          />
        </div>
      </div>
      <div className={styles.order_total_container}>
        <p className={styles.order_total_text}>
          Всего минут: <span className={styles.order_total_minutes}>{totalMinutes}</span>
        </p>
      </div>
      <div className={styles.order_map}>
        <div className={styles.order_map_private_comp} style ={{top: "295px", right: "445px"}}>1</div>
        <div className={styles.order_map_private_comp} style ={{top: "295px", right: "404px"}}>2</div>
        <div className={styles.order_map_private_comp} style ={{top: "295px", right: "362px"}}>3</div>
        <div className={styles.order_map_private_comp} style ={{top: "295px", right: "321px"}}>4</div>
        <div className={styles.order_map_private_comp} style ={{top: "295px", right: "279px"}}>5</div>

        <div className={styles.order_map_private_comp} style ={{top: "295px", right: "222px"}}>6</div>
        <div className={styles.order_map_private_comp} style ={{top: "295px", right: "178px"}}>7</div>

        <div className={styles.order_map_default_comp} style ={{top: "530px", right: "520px"}}>8</div>
        <div className={styles.order_map_default_comp} style ={{top: "570px", right: "520px"}}>9</div>
        <div className={styles.order_map_default_comp} style ={{top: "610px", right: "520px"}}>10</div>
        <div className={styles.order_map_default_comp} style ={{top: "650px", right: "520px"}}>11</div>
        <div className={styles.order_map_default_comp} style ={{top: "690px", right: "520px"}}>12</div>
        <div className={styles.order_map_default_comp} style ={{top: "690px", right: "480px"}}>13</div>
        <div className={styles.order_map_default_comp} style ={{top: "690px", right: "440px"}}>14</div>
        <div className={styles.order_map_default_comp} style ={{top: "690px", right: "400px"}}>15</div>

        <div className={styles.order_map_default_comp} style ={{top: "480px", right: "400px"}}>16</div>
        <div className={styles.order_map_default_comp} style ={{top: "520px", right: "400px"}}>17</div>
        <div className={styles.order_map_default_comp} style ={{top: "560px", right: "400px"}}>18</div>
        <div className={styles.order_map_default_comp} style ={{top: "600px", right: "400px"}}>19</div>


        <div className={styles.order_map_psvr_comp} style ={{top: "535px", right: "70px"}}>1</div>
        <div className={styles.order_map_psvr_comp} style ={{top: "535px", right: "185px"}}>1</div>

        <div className={styles.order_map_vip_comp} style ={{top: "595px", right: "235px"}}>1</div>
        <div className={styles.order_map_vip_comp} style ={{top: "595px", right: "155px"}}>2</div>
        <div className={styles.order_map_vip_comp} style ={{top: "595px", right: "75px"}}>3</div>

        <div className={styles.order_map_vip_comp} style ={{top: "675px", right: "75px"}}>4</div>
        <div className={styles.order_map_vip_comp} style ={{top: "675px", right: "145px"}}>5</div>
      </div>
    </div>
  );
}

