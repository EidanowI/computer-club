import styles from "./PriceSection.module.css"

export default function PriceSection(){
    return (
        <div className={styles.price_sec_conteiner}>
            <h2 className={styles.price_sec_title}>Стоимость</h2>

            <table className={styles.price_sec_table}>
                <tbody>
                    <tr className={styles.price_sec_table_tr}>
                        <td className={styles.price_sec_table_td}>08:00-17:00</td>
                        <td className={styles.price_sec_table_td}>3 руб.</td>
                        <td className={styles.price_sec_table_td}>4 руб.</td>
                        <td className={styles.price_sec_table_td}>7 руб.</td>
                    </tr>
                    <tr className={styles.price_sec_table_tr}>
                        <td className={styles.price_sec_table_td}>17:00-08::00</td>
                        <td className={styles.price_sec_table_td}>4 руб.</td>
                        <td className={styles.price_sec_table_td}>5 руб.</td>
                        <td className={styles.price_sec_table_td}>8 руб.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}