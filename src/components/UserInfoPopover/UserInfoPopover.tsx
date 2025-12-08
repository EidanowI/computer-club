import { useRef, useEffect, useState } from 'react';
import styles from './UserInfoPopover.module.css';

interface User {
  id: number;
  login: string;
  name: string;
  phone: string;
  isAdmin: boolean;
}

interface UserInfoPopoverProps {
  user: User;
  isVisible: boolean;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  onLogout: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function UserInfoPopover({ 
  user, 
  isVisible, 
  buttonRef, 
  onLogout,
  onMouseEnter,
  onMouseLeave 
}: UserInfoPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isVisible && buttonRef.current && popoverRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const popoverHeight = popoverRef.current.offsetHeight || 200; // Примерная высота
      
      // Позиционирование справа от кнопки, выравнивание по верхнему краю кнопки
      const left = buttonRect.right + 5; // Уменьшили расстояние до 5px
      let top = buttonRect.top - 140; // Поднимаем выше на 60px
      
      // Проверка, чтобы popover не выходил за границы экрана
      const windowHeight = window.innerHeight;
      if (top + popoverHeight > windowHeight) {
        top = windowHeight - popoverHeight - 10;
      }
      if (top < 10) {
        top = 10;
      }
      
      setPosition({ top, left });
    }
  }, [isVisible, buttonRef]);

  if (!isVisible) return null;

  return (
    <div
      ref={popoverRef}
      className={styles.popover}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.popoverContent}>
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
        </div>
        <button className={styles.logoutButton} onClick={onLogout}>
          Выйти
        </button>
      </div>
    </div>
  );
}

