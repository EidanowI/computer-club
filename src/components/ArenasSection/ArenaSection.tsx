import styles from "./ArenaSection.module.css"

export default function ArenaSection(){
    return (
        <div className={styles.arenas_sec_conteiner}>
            <h2 className={styles.arenas_sec_title}>Арены</h2>
            <div className={styles.arenas_sec_text_wrapper}>
                <div className={styles.arenas_sec_text_container}>
                    
                    <p className={styles.arenas_sec_text}>ComputerClub – предлагает несколько арен:
                    </p>
                    <br></br>
                    <p className={styles.arenas_sec_text}>- общая площадь</p>
                    <p className={styles.arenas_sec_text}>- две езакрытые арены на 5 и 2 компьютера</p>
                    <p className={styles.arenas_sec_text}>- закрыйтый VR зал</p>
                    <p className={styles.arenas_sec_text}>- VIP зал со всеми удобствами</p>
                    <br></br>
                    <p className={styles.arenas_sec_text}>Также, для любителей PS5 наш киберлаунж предлагает комфортные зоны с диванами и TV за 7 копеек в минуту или 4.2 рубля за час.</p>
                </div>
            </div>
        </div>
    );
}