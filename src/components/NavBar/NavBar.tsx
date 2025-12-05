import "./NavBar.module.css"
import React, { useState, useEffect } from 'react';
import styles from "./NavBar.module.css"


interface NavItem {
  id: string;
  label: string;
  iconPath: string;
}

interface NavigationProps {
  sections: NavItem[];
}

export default function NavBar({ sections } : NavigationProps){
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');

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

  return (
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
        {/* <button className={styles.signin_button}><img src="../../public/img/login-person.png" className={styles.signin_img}></img>Войти</button> */}
        {/* <button className={styles.loged_admin_button}><img src="../../public/img/admin-icon.png" className={styles.loged_admin_button_img}></img>Админ</button> */}
        <button className={styles.loged_user_button}>Александр</button>

      {/* <div className="nav-header">
        <h3>Навигация</h3>
      </div>
      <ul className="nav-list">
        {sections.map((section) => (
          <li key={section.id} className="nav-item">
            <button
              className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => handleNavClick(section.id)}
            >
              {section.label}
            </button>
          </li>
        ))}
      </ul> */}
    </nav>
  );
}
