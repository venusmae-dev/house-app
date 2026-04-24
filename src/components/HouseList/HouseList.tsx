import { useState, useEffect, useRef } from "react";
import { getHouses, House } from "@/api/houses";
import HouseCard from "@/components/HouseCard/HouseCard";
import styles from "./HouseList.module.css";
import { Spinner } from "../ui/spinner";

interface HouseListProps {
  onFavorite: (house: House) => void;
  isFavorited: (id: number) => boolean;
}

const HouseList = ({ onFavorite, isFavorited }: HouseListProps) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [error, setError] = useState(false);

  // tracks which pages have been successfully fetched, prevents duplicate fetches
  const fetchedPages = useRef(new Set<number>());

  // references a div at the bottom of the list, used by the Intersection Observer to detect when users scroll to the bottom of the page
  const bottomRef = useRef<HTMLDivElement>(null);

  // the following refs mirror the state values above but as refs so the Intersection Observer can read them without going stale.
  // the Observer is set up once and can't read updated state directly, so refs act as a live window into current values
  const hasMoreRef = useRef(hasMorePages);
  const loadingRef = useRef(loading);
  const errorRef = useRef(error);

  // syncing state to refs so the Observer callback always has access to the latest values without needing to be re-registered on every state change
  // runs anytime anything changes
  useEffect(() => {
    hasMoreRef.current = hasMorePages;
    loadingRef.current = loading;
    errorRef.current = error;
  });

  // runs whenever the page number changes, responsible for fetching data for that page
  useEffect(() => {
    if (fetchedPages.current.has(page)) return;

    let retryTimeout: ReturnType<typeof setTimeout>;
    setLoading(true);
    setError(false);

    // define fetchPage as an inner function so it can be called recursively for retries without needing to be declared outside the effect or added as a dependency
    const fetchPage = () => {
      // default of 10 houses per page balances initial load time and scroll smoothness
      // increasing this value would reduce the number of API calls but slow down the initial render
      // and increase memory usage due to more images being fetched simultaneously
      getHouses(page)
        .then((data) => {
          fetchedPages.current.add(page);
          setHouses((prev) => {
            const existingIds = new Set(prev.map((h) => h.id));
            const newHouses = data.houses.filter((h) => !existingIds.has(h.id));
            return [...prev, ...newHouses];
          });
          // as long as we get 10 houses back, we assume there may be more pages. if we get less than 10, we've likely reached the end and can stop trying to fetch more (based on a default of 10 houses per page from the spec)
          setHasMorePages(data.houses.length === 10);
          setLoading(false);
          setError(false);
        })
        .catch(() => {
          setError(true);
          retryTimeout = setTimeout(() => {
            fetchPage();
          }, 1500); // arbitrary retry delay, small enough to recover quickly but long enough to avoid spamming the API if something is wrong
        });
    };

    fetchPage();

    // clear the retry timeout if the component unmounts or if the page changes before the timeout triggers, preventing memory leaks and unwanted fetches
    return () => {
      clearTimeout(retryTimeout);
    };
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;

        // only attempt to load the next page if we have successfully loaded at least one page (prevents triggering on initial load), we have more pages to load, we're not already in the process of loading a page, and we haven't encountered an error.
        if (
          fetchedPages.current.size > 0 &&
          hasMoreRef.current &&
          !loadingRef.current &&
          !errorRef.current
        ) {
          observer.disconnect(); // stop observing until next houses update
          setPage((prev) => prev + 1);
        }
      },
      // using a threshold of 1.0 means the callback will only trigger when the entire bottom div is visible, which helps prevent premature triggers that can happen with lower thresholds when the user is scrolling quickly
      // api calls are expensive!
      { threshold: 1.0 },
    );

    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [houses]);

  return (
    <div className={styles.houseGrid}>
      {houses.map((house) => (
        <HouseCard
          key={house.id}
          house={house}
          onFavorite={onFavorite}
          isFavorited={isFavorited(house.id)}
        />
      ))}

      {(loading || error) && (
        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "center",
            padding: "32px 0",
          }}
        >
          <Spinner className='size-8' />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default HouseList;
