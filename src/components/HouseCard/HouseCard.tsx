import { House } from "@/api/houses";
import styles from "./HouseCard.module.css";

interface HouseCardProps {
  house: House;
  onFavorite: (house: House) => void;
  isFavorited: boolean;
}

const HouseCard = ({ house, onFavorite, isFavorited }: HouseCardProps) => {
  return (
    <div className={styles.houseCard}>
      <div className={styles.imageWrapper}>
        <img src={house.photoURL} alt={house.address} className={styles.cardImage} />
        <button className={styles.favoriteBtn} onClick={() => onFavorite(house)}>
          {isFavorited ? "♥" : "♡"}
        </button>
      </div>
      <div className={styles.cardDetails}>
        <p className={styles.cardPrice}>${house.price.toLocaleString()}</p>
        <p className={styles.homeowner}>Owned by {house.homeowner}</p>
        <p className={styles.address}>{house.address}</p>
      </div>
    </div>
  );
};

export default HouseCard;
