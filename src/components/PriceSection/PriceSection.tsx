import styles from "./PriceSection.module.css"

export default function PriceSection(){
    return (    
        <div className={styles.price_sec_conteiner}>
            <h2 className={styles.price_sec_title}>Стоимость</h2>
            <div className={styles.price_sec_text_wrapper}>
                <div className={styles.price_sec_text_container}>
                    
                    <p className={styles.price_sec_text}>ComputerClub – предлагает широкий выбор цен для любого кошелька:
                    </p>
                    <br></br>
                    <p className={styles.price_sec_text}>Игровая зона ComputerClub разделена на залы:</p>
                    <p className={styles.price_sec_text}>- общий 5 копеек минута или 3 рубля за час</p>
                    <p className={styles.price_sec_text}>- премиум зал 7 копеек минута или 4.2 рубля за час</p>
                    <p className={styles.price_sec_text}>- VR за 12 копеек минута или 7.2 рубля за час</p>
                    <p className={styles.price_sec_text}>- VIP зал за 12 копеек минута или 7.2 рубля за час</p>
                    <br></br>
                    <p className={styles.price_sec_text}>Также, для любителей PS5 наш киберлаунж предлагает комфортные зоны с диванами и TV за 7 копеек в минуту или 4.2 рубля за час.</p>
                </div>
            </div>
        </div>
    );
}