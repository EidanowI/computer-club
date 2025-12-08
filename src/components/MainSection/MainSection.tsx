import styles from "./MainSection.module.css"

export default function MainSection(){
  const handleNavClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (<>


    <div className={styles.main_sec_conteiner}>
      <div className={styles.main_sec_main}>
        <div className={styles.main_sec_label_cont}>
          <p className={styles.main_sec_label_update_msg}>ОБНОВЛЕНИЕ - GEFORCE 3060 НА БОРТУ</p>
          <h1 className={styles.main_sec_label_info_msg}>3 РУБЛЯ ЗА ЧАС ИГРЫ!</h1>
          <button className={styles.main_sec_main_morebtn} onClick={() => handleNavClick("price")}>УЗНАТЬ БОЛЬШЕ</button>
        </div>
      </div>
      <div className={styles.main_sec_lounge}>
        <img className={styles.main_sec_lounge_logo} src="../../public/img/logo.png"></img>
        <p className={styles.main_sec_lounge_msg}>ПЕРВЫЙ КИБЕРЛАУНДЖ В МИНКЕ!</p>
      </div>
      <div className={styles.main_sec_devices}>
        <p className={styles.main_sec_card_title}>Узнай что у нас есть</p>
        <p className={styles.main_sec_card_subtitle}>Девайсы</p>
        <button className={styles.main_sec_devices_morebtn} onClick={() => handleNavClick("price")}>Смотреть все</button>
      </div>
      <div className={styles.main_sec_compets}>
        <p className={styles.main_sec_card_title}>Побеждай вместе с нами</p>
        <p className={styles.main_sec_card_subtitle}>Турниры</p>
        <button className={styles.main_sec_compets_morebtn} onClick={() => handleNavClick("price")}>Ближайшие даты</button>
      </div>
      <div className={styles.main_sec_contacts}>
        <p className={styles.main_sec_card_title}>Играй в любое время</p>
        <p className={styles.main_sec_card_subtitle}>Контакты</p>
        <button className={styles.main_sec_contacts_morebtn} onClick={() => handleNavClick("price")}>Смотреть все</button>
      </div>
    </div>
  </>);
}