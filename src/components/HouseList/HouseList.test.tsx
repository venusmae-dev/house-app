/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import HouseList from "./HouseList";
import * as housesApi from "@/api/houses";
import type { House } from "@/api/houses";

vi.mock("@/api/houses", () => ({
  getHouses: vi.fn(),
}));

const makeHouses = (count: number, startId = 1) =>
  Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    address: `${startId + i} Main St`,
    homeowner: `Owner ${startId + i}`,
    price: 100000 + i * 1000,
    photoURL: `https://example.com/${startId + i}.jpg`,
  }));

// Wrapper that replicates App.tsx's favorites state so we can test the full
// click → state → re-render cycle without mocking isFavorited.
function WithFavoritesState() {
  const [favorites, setFavorites] = useState<House[]>([]);
  const handleFavorite = (house: House) =>
    setFavorites((prev) =>
      prev.find((h) => h.id === house.id)
        ? prev.filter((h) => h.id !== house.id)
        : [...prev, house],
    );
  const isFavorited = (id: number) => favorites.some((h) => h.id === id);
  return <HouseList onFavorite={handleFavorite} isFavorited={isFavorited} />;
}

describe("HouseList", () => {
  let onFavorite: ReturnType<typeof vi.fn>;
  let isFavorited: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onFavorite = vi.fn();
    isFavorited = vi.fn().mockReturnValue(false);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows a spinner on initial load", () => {
    vi.mocked(housesApi.getHouses).mockReturnValue(new Promise(() => {}));

    render(<HouseList onFavorite={onFavorite} isFavorited={isFavorited} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders house cards after data loads and hides the spinner", async () => {
    vi.mocked(housesApi.getHouses).mockResolvedValue({
      ok: true,
      houses: makeHouses(3),
    });

    render(<HouseList onFavorite={onFavorite} isFavorited={isFavorited} />);

    await screen.findByText("1 Main St");
    expect(screen.getByText("2 Main St")).toBeInTheDocument();
    expect(screen.getByText("3 Main St")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps the spinner visible after an API error on initial load", async () => {
    vi.mocked(housesApi.getHouses).mockRejectedValue(new Error("Network error"));

    render(<HouseList onFavorite={onFavorite} isFavorited={isFavorited} />);

    await waitFor(() => expect(housesApi.getHouses).toHaveBeenCalled());
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("calls onFavorite with the correct house when the favorite button is clicked", async () => {
    const houses = makeHouses(1);
    vi.mocked(housesApi.getHouses).mockResolvedValue({ ok: true, houses });

    render(<HouseList onFavorite={onFavorite} isFavorited={isFavorited} />);
    await screen.findByText("1 Main St");

    await userEvent.click(screen.getByRole("button"));

    expect(onFavorite).toHaveBeenCalledTimes(1);
    expect(onFavorite).toHaveBeenCalledWith(houses[0]);
  });

  it("shows a filled heart for a favorited house and an empty heart otherwise", async () => {
    vi.mocked(housesApi.getHouses).mockResolvedValue({
      ok: true,
      houses: makeHouses(2),
    });
    // Only house with id=1 is favorited
    isFavorited.mockImplementation((id: number) => id === 1);

    render(<HouseList onFavorite={onFavorite} isFavorited={isFavorited} />);
    await screen.findByText("1 Main St");

    const [firstBtn, secondBtn] = screen.getAllByRole("button");
    expect(firstBtn).toHaveTextContent("♥");
    expect(secondBtn).toHaveTextContent("♡");
  });

  it("adds a favorited house to the favorites list and updates the heart icon", async () => {
    vi.mocked(housesApi.getHouses).mockResolvedValue({
      ok: true,
      houses: makeHouses(2),
    });

    render(<WithFavoritesState />);
    await screen.findByText("1 Main St");

    const [firstBtn, secondBtn] = screen.getAllByRole("button");
    expect(firstBtn).toHaveTextContent("♡");

    await userEvent.click(firstBtn);

    expect(firstBtn).toHaveTextContent("♥");
    expect(secondBtn).toHaveTextContent("♡");
  });

  it("shows a spinner and keeps loaded houses visible when a later page fetch fails", async () => {
    let latestCallback: IntersectionObserverCallback | null = null;
    class MockIO {
      constructor(cb: IntersectionObserverCallback) { latestCallback = cb; }
      observe = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal("IntersectionObserver", MockIO);

    vi.mocked(housesApi.getHouses)
      .mockResolvedValueOnce({ ok: true, houses: makeHouses(10) })
      .mockRejectedValueOnce(new Error("Network error"));

    render(<HouseList onFavorite={onFavorite} isFavorited={isFavorited} />);
    await screen.findByText("1 Main St");

    act(() => {
      latestCallback!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    await waitFor(() => expect(housesApi.getHouses).toHaveBeenCalledWith(2));

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("1 Main St")).toBeInTheDocument();
    expect(screen.getByText("10 Main St")).toBeInTheDocument();
  });

  it("fetches the next page when the bottom sentinel becomes visible", async () => {
    let latestCallback: IntersectionObserverCallback | null = null;
    class MockIO {
      constructor(cb: IntersectionObserverCallback) { latestCallback = cb; }
      observe = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal("IntersectionObserver", MockIO);

    vi.mocked(housesApi.getHouses)
      .mockResolvedValueOnce({ ok: true, houses: makeHouses(10) })
      .mockResolvedValueOnce({ ok: true, houses: makeHouses(5, 11) });

    render(<HouseList onFavorite={onFavorite} isFavorited={isFavorited} />);
    await screen.findByText("1 Main St");

    act(() => {
      latestCallback!(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    await waitFor(() => expect(housesApi.getHouses).toHaveBeenCalledWith(2));
    await screen.findByText("11 Main St");
  });
});
