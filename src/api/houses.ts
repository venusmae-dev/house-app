// in production, sensitive urls and api keys should be stored in a .env file
// and accessed via import.meta.env.VITE_API_BASE_URL.
// for the sake of this exercise, we'll hardcode the base url here
const BASE_URL = "https://staging.homevision.co/api_project/houses";

export interface HouseDataResponse {
  houses: House[];
  ok: boolean;
}

export interface House {
  id: number;
  address: string;
  homeowner: string;
  price: number;
  photoURL: string;
}

// using native fetch because we only have one endpoint and I didn't need the overhead of a library like axios
export const getHouses = async (page: number, perPage: number = 10): Promise<HouseDataResponse> => {
  const res = await fetch(`${BASE_URL}/?page=${page}&per_page=${perPage}`);
  if (!res.ok) throw new Error(`Failed to fetch houses: ${res.status}`);
  return res.json();
};
