import "./NavBar.module.css"
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./NavBar.module.css"
import LoginModal from '../LoginModal/LoginModal';
import UserInfoPopover from '../UserInfoPopover/UserInfoPopover';

interface NavItem {
  id: string;
  label: string;
  iconPath: string;
}

interface NavigationProps {
  sections: NavItem[];
}

interface User {
  id: number;
  login: string;
  name: string;
  phone: string;
  isAdmin: boolean;
}

export default function NavBar({ sections } : NavigationProps){
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserPopoverVisible, setIsUserPopoverVisible] = useState(false);
  const userButtonRef = useRef<HTMLButtonElement | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  const handleNavClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Автоматическое определение активной секции при скролле
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      return jsonData.user;
      
    } catch (err) {
      console.error('Ошибка:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const userData = await fetchUser();
      setUser(userData);
      setIsUserPopoverVisible(false); // Убеждаемся, что popover закрыт при загрузке
    };
    loadData();
  }, []);
  
  // Закрываем popover при изменении пользователя
  useEffect(() => {
    if (!user) {
      setIsUserPopoverVisible(false);
    }
  }, [user]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleLoginSuccess = async () => {
    const userData = await fetchUser();
    setUser(userData);
    setIsUserPopoverVisible(false); // Закрываем popover после входа
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setUser(null);
        setIsUserPopoverVisible(false); // Закрываем popover при выходе
      }
    } catch (err) {
      console.error('Ошибка выхода:', err);
    }
  };

  const handleMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsUserPopoverVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsUserPopoverVisible(false);
    }, 200); // Задержка 200ms перед закрытием
  }, []);

  const renderAuthButton = () => {
    if (loading) {
      return <button className={styles.loged_user_button} disabled>Загрузка...</button>;
    }

    if (!user) {
      return (
        <button 
          className={styles.signin_button}
          onClick={() => setIsLoginModalOpen(true)}
        >
          <img src="././public/img/login-person.png" className={styles.signin_img} alt="Войти" />
          Войти
        </button>
      );
    }

    if (user.isAdmin) {
      return (
        <button 
          className={styles.loged_admin_button}
          onClick={() => navigate('/profile')}
        >
          <img src="././public/img/admin-icon.png" className={styles.loged_admin_button_img} alt="Админ" />
          Админ
        </button>
      );
    }

    const handleUserButtonClick = () => {
      setIsUserPopoverVisible(false); // Закрываем popover при клике
      navigate('/profile');
    };

    return (
      <>
        <button 
          ref={userButtonRef}
          className={styles.loged_user_button}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleUserButtonClick}
        >
          {user.name}
        </button>
        <UserInfoPopover
          user={user}
          isVisible={isUserPopoverVisible}
          buttonRef={userButtonRef}
          onLogout={handleLogout}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </>
    );
  };

  return (
    <>
    <nav className={styles.nav_bar_conteiner}>
      <div className={styles.nav_logo_conteiner}>
        <img className={styles.nav_logo_conteiner_img} src="././public/img/logo.png" onClick={() => handleNavClick(sections[0].id)}></img>
      </div>
      <ul className={styles.nav_list}>
        {sections.map((section) => (section.id == "home" ? "" : 
          <li key={section.id} 
            className={`${styles.nav_button} ${activeSection === section.id ? styles.active : ''}`}
            onClick={() => handleNavClick(section.id)}
          >
            
              <div className={styles.nav_icon_conteiner}>
                <img src={section.iconPath}></img>
              </div>
               <p>{section.label}</p>
          </li>
        ))}
      </ul>
        {renderAuthButton()}
    </nav>
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}
