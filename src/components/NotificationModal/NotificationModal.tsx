import styles from './NotificationModal.module.css';

interface NotificationModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function NotificationModal({ isOpen, message, onClose }: NotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2 className={styles.modalTitle}>Уведомление</h2>
        <p className={styles.modalMessage}>{message}</p>
        <button className={styles.okButton} onClick={onClose}>
          ОК
        </button>
      </div>
    </div>
  );
}

