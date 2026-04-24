import styles from "./Header.module.css";
import { HeartIcon, ArrowLeftIcon, LogOut, HouseHeart } from "lucide-react";

interface HeaderProps {
  showFavorites: boolean;
  favoritesCount: number;
  isLoggedOut?: boolean;
  onToggleFavorites: () => void;
  onHandleLogout: () => void;
}

const Header = ({
  showFavorites,
  isLoggedOut,
  favoritesCount,
  onToggleFavorites,
  onHandleLogout,
}: HeaderProps) => {
  return (
    <header className={styles.header}>
      <h1 className={styles.headerTitle}>
        <span>
          <HouseHeart />
        </span>
        Haus
      </h1>
      <nav className={styles.headerNav}>
        {showFavorites && !isLoggedOut ? (
          <button onClick={onToggleFavorites} className={styles.headerLink}>
            <ArrowLeftIcon size={18} />
            Back
          </button>
        ) : (
          <button onClick={onToggleFavorites} className={styles.headerLink}>
            <HeartIcon
              size={18}
              style={{
                color: favoritesCount > 0 ? "#d06171" : "#ffffff",
                flexShrink: 0,
              }}
            />
            <span style={{ whiteSpace: "nowrap" }}>
              Favorites {favoritesCount > 0 && `(${favoritesCount})`}
            </span>
          </button>
        )}
      </nav>
      <button className={styles.footer} onClick={onHandleLogout}>
        <LogOut size={18} style={{ color: "#ffffff" }} />
        Logout
      </button>
    </header>
  );
};

export default Header;
