import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./Order.module.css";
import NotificationModal from '../../components/NotificationModal/NotificationModal';

// Интерфейс для компьютера
interface Computer {
  id: number;
  deviceId: number;
  label: string;
  type: 'private' | 'default' | 'psvr' | 'vip';
  style: { top: string; right: string };
}

// Маппинг компьютеров с их device_id
const computers: Computer[] = [
  // Private computers (1-7)
  { id: 1, deviceId: 1, label: '1', type: 'private', style: { top: '295px', right: '445px' } },
  { id: 2, deviceId: 2, label: '2', type: 'private', style: { top: '295px', right: '404px' } },
  { id: 3, deviceId: 3, label: '3', type: 'private', style: { top: '295px', right: '362px' } },
  { id: 4, deviceId: 4, label: '4', type: 'private', style: { top: '295px', right: '321px' } },
  { id: 5, deviceId: 5, label: '5', type: 'private', style: { top: '295px', right: '279px' } },
  { id: 6, deviceId: 6, label: '6', type: 'private', style: { top: '295px', right: '222px' } },
  { id: 7, deviceId: 7, label: '7', type: 'private', style: { top: '295px', right: '178px' } },
  // Default computers (8-19)
  { id: 8, deviceId: 8, label: '8', type: 'default', style: { top: '530px', right: '520px' } },
  { id: 9, deviceId: 9, label: '9', type: 'default', style: { top: '570px', right: '520px' } },
  { id: 10, deviceId: 10, label: '10', type: 'default', style: { top: '610px', right: '520px' } },
  { id: 11, deviceId: 11, label: '11', type: 'default', style: { top: '650px', right: '520px' } },
  { id: 12, deviceId: 12, label: '12', type: 'default', style: { top: '690px', right: '520px' } },
  { id: 13, deviceId: 13, label: '13', type: 'default', style: { top: '690px', right: '480px' } },
  { id: 14, deviceId: 14, label: '14', type: 'default', style: { top: '690px', right: '440px' } },
  { id: 15, deviceId: 15, label: '15', type: 'default', style: { top: '690px', right: '400px' } },
  { id: 16, deviceId: 16, label: '16', type: 'default', style: { top: '480px', right: '400px' } },
  { id: 17, deviceId: 17, label: '17', type: 'default', style: { top: '520px', right: '400px' } },
  { id: 18, deviceId: 18, label: '18', type: 'default', style: { top: '560px', right: '400px' } },
  { id: 19, deviceId: 19, label: '19', type: 'default', style: { top: '600px', right: '400px' } },
  // PSVR computers (20-21)
  { id: 20, deviceId: 20, label: '1', type: 'psvr', style: { top: '535px', right: '70px' } },
  { id: 21, deviceId: 21, label: '1', type: 'psvr', style: { top: '535px', right: '185px' } },
  // VIP computers (22-26)
  { id: 22, deviceId: 22, label: '1', type: 'vip', style: { top: '595px', right: '235px' } },
  { id: 23, deviceId: 23, label: '2', type: 'vip', style: { top: '595px', right: '155px' } },
  { id: 24, deviceId: 24, label: '3', type: 'vip', style: { top: '595px', right: '75px' } },
  { id: 25, deviceId: 25, label: '4', type: 'vip', style: { top: '675px', right: '75px' } },
  { id: 26, deviceId: 26, label: '5', type: 'vip', style: { top: '675px', right: '145px' } },
];

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

  const [selectedDate, setSelectedDate] = useState(today);
  const [timeFrom, setTimeFrom] = useState(getCurrentTime());
  const [minuteCount, setMinuteCount] = useState(60); // По умолчанию 60 минут (1 час)
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [busyDeviceIds, setBusyDeviceIds] = useState<number[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [loadingBusyDevices, setLoadingBusyDevices] = useState(false);
  const [tarifInfo, setTarifInfo] = useState<{ tarifId: number; minuteCost: number } | null>(null);
  const [loadingTarif, setLoadingTarif] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

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

  // Функция для получения занятых устройств с бэкэнда
  const fetchBusyDevices = useCallback(async () => {
    if (!selectedDate || !timeFrom || !minuteCount || minuteCount <= 0) {
      setBusyDeviceIds([]);
      return;
    }

    // Вычисляем время окончания заказа
    const [fromHours, fromMinutes] = timeFrom.split(':').map(Number);
    const fromTotalMinutes = fromHours * 60 + fromMinutes;
    const toTotalMinutes = fromTotalMinutes + minuteCount;
    
    // Вычисляем часы и минуты
    // Если заказ переходит через полночь, ограничиваем до 23:59 того же дня
    const maxMinutesInDay = 24 * 60; // 1440 минут
    const finalToMinutes = Math.min(toTotalMinutes, maxMinutesInDay - 1); // Максимум 23:59
    
    const toHours = Math.floor(finalToMinutes / 60);
    const toMins = finalToMinutes % 60;
    const timeTo = `${String(toHours).padStart(2, '0')}:${String(toMins).padStart(2, '0')}`;

    setLoadingBusyDevices(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/busy-devices?date=${selectedDate}&timeFrom=${timeFrom}&timeTo=${timeTo}`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBusyDeviceIds(data.busyDeviceIds || []);
    } catch (error) {
      console.error('Ошибка при получении занятых устройств:', error);
      setBusyDeviceIds([]);
    } finally {
      setLoadingBusyDevices(false);
    }
  }, [selectedDate, timeFrom, minuteCount]);

  // Запрашиваем занятые устройства при изменении даты, времени или количества минут
  useEffect(() => {
    if (isAuthorized && timeFrom && minuteCount > 0) {
      fetchBusyDevices();
    }
  }, [selectedDate, timeFrom, minuteCount, isAuthorized, fetchBusyDevices]);

  // Функция для получения информации о тарифе устройства
  const fetchDeviceTarif = useCallback(async (deviceId: number) => {
    setLoadingTarif(true);
    setTarifInfo(null);
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/device-tarif/${deviceId}`,
        {
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTarifInfo({
        tarifId: data.tarifId,
        minuteCost: data.minuteCost
      });
    } catch (error) {
      console.error('Ошибка при получении информации о тарифе:', error);
      setTarifInfo(null);
    } finally {
      setLoadingTarif(false);
    }
  }, []);

  // Обработчик клика на компьютер
  const handleComputerClick = (deviceId: number) => {
    if (busyDeviceIds.includes(deviceId)) {
      return; // Нельзя выбрать занятый компьютер
    }
    const newSelectedId = deviceId === selectedDeviceId ? null : deviceId;
    setSelectedDeviceId(newSelectedId);
    
    // Получаем информацию о тарифе при выборе устройства
    if (newSelectedId) {
      fetchDeviceTarif(newSelectedId);
    } else {
      setTarifInfo(null);
    }
  };

  // Получить класс стиля для компьютера
  const getComputerClassName = (computer: Computer) => {
    const baseClass = `order_map_${computer.type}_comp`;
    const isBusy = busyDeviceIds.includes(computer.deviceId);
    const isSelected = selectedDeviceId === computer.deviceId;
    
    if (isBusy) {
      return `${styles[baseClass]} ${styles.order_map_comp_busy}`;
    }
    if (isSelected) {
      return `${styles[baseClass]} ${styles.order_map_comp_selected}`;
    }
    return styles[baseClass];
  };

  const handleTimeFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeFrom(e.target.value);
  };

  const handleMinuteCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    if (value >= 0) {
      setMinuteCount(value);
    }
  };

  const isValid = minuteCount > 0 && timeFrom !== '';

  // Расчет общей стоимости
  const totalCost = tarifInfo && minuteCount > 0 
    ? (tarifInfo.minuteCost * minuteCount).toFixed(2)
    : '0.00';

  // Обработчик оформления заказа
  const handleCreateOrder = async () => {
    if (!selectedDeviceId || !tarifInfo || !isValid || minuteCount <= 0) {
      setOrderError('Заполните все поля и выберите устройство');
      return;
    }

    setOrderLoading(true);
    setOrderError(null);
    setOrderSuccess(false);

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          minuteCount: minuteCount,
          date: selectedDate,
          time: timeFrom,
          tarifId: tarifInfo.tarifId,
          deviceId: selectedDeviceId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании заказа');
      }

      await response.json();
      setOrderSuccess(true);
      
      // Перенаправление на главную страницу через 2 секунды
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Ошибка при создании заказа:', error);
      setOrderError(error.message || 'Ошибка при создании заказа');
    } finally {
      setOrderLoading(false);
    }
  };

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
          <label className={styles.order_time_label}>Время начала</label>
          <div className={styles.order_time_select_container}>
            <select
              className={styles.order_time_select}
              value={timeFrom ? timeFrom.split(':')[0] : '00'}
              onChange={(e) => {
                const newHours = e.target.value;
                const currentMinutes = timeFrom ? timeFrom.split(':')[1] : '00';
                const newTime = `${newHours}:${currentMinutes}`;
                handleTimeFromChange({ target: { value: newTime } } as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={String(i).padStart(2, '0')}>
                  {String(i).padStart(2, '0')}
                </option>
              ))}
            </select>
            <span className={styles.order_time_separator}>:</span>
            <select
              className={styles.order_time_select}
              value={timeFrom ? timeFrom.split(':')[1] : '00'}
              onChange={(e) => {
                const newMinutes = e.target.value;
                const currentHours = timeFrom ? timeFrom.split(':')[0] : '00';
                const newTime = `${currentHours}:${newMinutes}`;
                handleTimeFromChange({ target: { value: newTime } } as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={String(i).padStart(2, '0')}>
                  {String(i).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.order_time_group}>
          <label className={styles.order_time_label}>Количество минут</label>
          <input
            type="number"
            className={`${styles.order_minute_input} ${!isValid ? styles.order_time_input_error : ''}`}
            value={minuteCount}
            onChange={handleMinuteCountChange}
            min="1"
            placeholder="Введите количество минут"
          />
        </div>
      </div>
      <div className={styles.order_total_container}>
        
        {tarifInfo && (
          <>
            <p className={styles.order_price_text}>
              Цена за минуту: <span className={styles.order_price_value}>{tarifInfo.minuteCost.toFixed(2)} руб.</span>
            </p>
            <p className={styles.order_total_cost_text}>
              Общая стоимость: <span className={styles.order_total_cost_value}>{totalCost} руб.</span>
            </p>
          </>
        )}
        {loadingTarif && (
          <p className={styles.order_loading_text}>Загрузка информации о тарифе...</p>
        )}
        {orderError && (
          <div className={styles.order_error_message}>{orderError}</div>
        )}
        {orderSuccess && (
          <div className={styles.order_success_message}>Заказ успешно оформлен! Перенаправление...</div>
        )}
        {selectedDeviceId && tarifInfo && minuteCount > 0 && isValid && (
          <button
            className={styles.order_submit_button}
            onClick={handleCreateOrder}
            disabled={orderLoading}
          >
            {orderLoading ? 'Оформление...' : 'Оформить заказ'}
          </button>
        )}
      </div>
      <div className={styles.order_map}>
        {computers.map((computer) => (
          <div
            key={computer.id}
            className={getComputerClassName(computer)}
            style={computer.style}
            onClick={() => handleComputerClick(computer.deviceId)}
          >
            {computer.label}
          </div>
        ))}
        {loadingBusyDevices && (
          <div className={styles.order_map_loading}>Загрузка...</div>
        )}
      </div>
      {selectedDeviceId && (() => {
        const selectedComputer = computers.find(c => c.deviceId === selectedDeviceId);
        const deviceType =  selectedComputer?.deviceId === 20 ? 'PS' : selectedComputer?.deviceId === 21 ? 'VR' : 
                          selectedComputer?.type === 'vip' ? 'VIP компьютер' : 
                          'компьютер';
        return (
          <div className={styles.order_selected_device}>
            Выбран {deviceType}: {selectedComputer?.label}
          </div>
        );
      })()}
    </div>
  );
}

