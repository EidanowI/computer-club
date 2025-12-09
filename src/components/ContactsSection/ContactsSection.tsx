import styles from "./ContactsSection.module.css"

export default function ContactsSection(){
    return (
    <>
        <div className={styles.contacts_sec_conteiner}>
            <h2 className={styles.contacts_sec_title}>Контакты</h2>

            <p className={styles.contacts_sec_sectitle}>Адрес</p>
            <p className={styles.contacts_sec_seccontent}>минск <br></br> чото гдето там</p>

            <p className={styles.contacts_sec_sectitle}>Email</p>
            <p className={styles.contacts_sec_seccontent}>compclub@example.com</p>

            <p className={styles.contacts_sec_sectitle}>Режим работы</p>
            <p className={styles.contacts_sec_seccontent}>круглосуточно 24/7</p>

            
        </div>
        <a className={styles.contacts_footer}>Политика конфиденциальности</a>
    </>
    );
}