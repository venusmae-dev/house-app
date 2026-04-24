import styles from "./LogoutPage.module.css";

interface LogoutPageProps {
  onLoginAgain: () => void;
}

const LogoutPage = ({ onLoginAgain }: LogoutPageProps) => {
  return (
    <div className={styles.container}>
      <p className={styles.message}>You are logged out.</p>
      <button className={styles.button} onClick={onLoginAgain}>
        Log in
      </button>
    </div>
  );
};

export default LogoutPage;
