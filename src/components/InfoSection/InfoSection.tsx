import styles from "./InfoSection.module.css"

export default function InfoSection(){
    return (
        <div className={styles.info_sec_conteiner}>
            <h2 className={styles.info_sec_title}>Игра начинается</h2>
            <div className={styles.info_sec_text_wrapper}>
                <div className={styles.info_sec_text_container}>
                    
                    <p className={styles.info_sec_text}>ComputerClub – первый киберлаунж в Минске, где каждый гость найдет себе занятие по душе. Дымная зона лаунж
                        с кальянами, бар в стиле лофт с чайной и коктейльной картами, большой выбор настольных игр, и, конечно
                        же, зона gaming.
                    </p>
                    <br></br>
                    <p className={styles.info_sec_text}>Игровая зона ComputerClub разделена на залы:</p>
                    <p className={styles.info_sec_text}>- общий зал на n машин</p>
                    <p className={styles.info_sec_text}>- VIP зал на n машин с профессиональным оборудованием</p>
                    <p className={styles.info_sec_text}>- VIP 2 зал на n машин с профессиональным оборудованием</p>
                    <p className={styles.info_sec_text}>- Super VIP зал на n машин с профессиональным оборудованием</p>
                    <br></br>
                    <p className={styles.info_sec_text}>Также, для любителей PS5 наш киберлаунж предлагает комфортные зоны с диванами и TV.</p>
                    <button className={styles.info_sec_orderbtn}>Сделать заказ</button>
                </div>
                <div className={styles.info_inter_cards_conteiner}>
                    <div className={styles.info_inter_card1}></div>
                    <div className={styles.info_inter_card2}></div>
                    <div className={styles.info_inter_card3}></div>
                    <div className={styles.info_inter_card4}></div>
                </div>
                
            </div>
        </div>
    )
}