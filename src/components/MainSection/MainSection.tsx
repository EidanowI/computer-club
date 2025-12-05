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
      <div className={styles.main_sec_devices}></div>
      <div className={styles.main_sec_compets}>4</div>
      <div className={styles.main_sec_contects}>7</div>
    </div>
  </>);
}