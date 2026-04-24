import { House } from "@/api/houses";
import HouseCard from "@/components/HouseCard/HouseCard";
import styles from "./FavoritesList.module.css";

interface FavoritesListProps {
  favorites: House[];
  onFavorite: (house: House) => void;
  isFavorited: (id: number) => boolean;
}

const FavoritesList = ({ favorites, onFavorite, isFavorited }: FavoritesListProps) => {
  if (favorites.length === 0) {
    return (
      <div className={styles.favoritesEmpty}>
        <p>No favorites yet — heart a listing to save it here.</p>
      </div>
    );
  }

  return (
    <div
      className={styles.favoritesGrid}
      style={
        favorites.length < 3
          ? {
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "24px",
            }
          : undefined
      }
    >
      {favorites.map((house) => (
        <HouseCard
          key={house.id}
          house={house}
          onFavorite={onFavorite}
          isFavorited={isFavorited(house.id)}
        />
      ))}
    </div>
  );
};

export default FavoritesList;
