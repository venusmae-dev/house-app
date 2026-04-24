import { useState } from "react";
import Header from "@/components/Header/Header";
import HouseList from "@/components/HouseList/HouseList";
import FavoritesList from "@/components/FavoritesList/FavoritesList";
import LogoutPage from "@/components/LogoutPage/LogoutPage";
import { House } from "@/api/houses";
import "./App.css";

function App() {
  // setting favorites in memory for simplicity, but in a real app, would want to persist via state management or localStorage to avoid losing data on refresh
  // placing favorites state in App so it can be shared between HouseList and FavoritesList. If we had more complex state or needed to share between more components, would consider using a state management library like Redux
  const [favorites, setFavorites] = useState<House[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const handleFavorite = (house: House) => {
    // using functional update form (prev =>) to ensure we always have the latest state value, since this function could be called multiple times in quick succession and we don't want to risk stale state
    setFavorites((prev) => {
      const exists = prev.find((h) => h.id === house.id);
      if (exists) return prev.filter((h) => h.id !== house.id);
      return [...prev, house];
    });
  };

  // for exercise purposes, we're just tracking logout with a boolean in state. In a real app, this would involve more complex logic like clearing auth tokens, redirecting to a login page, etc.
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  const handleLogout = () => {
    setIsLoggedOut(true);
    setShowFavorites(false);
  };

  // defined here and passed down as a prop so the source of truth stays in App
  // HouseCard doesn't need to know about the full favorites array, just whether its own house is favorited
  const isFavorited = (id: number) => favorites.some((h) => h.id === id);

  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1 }} className='app-layout'>
        <Header
          showFavorites={showFavorites}
          isLoggedOut={isLoggedOut}
          favoritesCount={favorites.length}
          onToggleFavorites={() => setShowFavorites((prev) => !prev)}
          onHandleLogout={handleLogout}
        />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {isLoggedOut ? (
            <LogoutPage onLoginAgain={() => setIsLoggedOut(false)} />
          ) : showFavorites ? (
            <FavoritesList
              favorites={favorites}
              onFavorite={handleFavorite}
              isFavorited={isFavorited}
            />
          ) : (
            <HouseList onFavorite={handleFavorite} isFavorited={isFavorited} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
