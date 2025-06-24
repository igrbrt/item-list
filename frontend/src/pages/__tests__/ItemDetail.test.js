import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ItemDetail from "../ItemDetail";

global.fetch = jest.fn();

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockItem = {
  id: 1,
  name: "Laptop Pro",
  category: "Electronics",
  price: 2499,
};

const renderWithRouter = (component, { route = "/items/1" } = {}) => {
  window.history.pushState({}, "Test page", route);

  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/items/:id" element={component} />
      </Routes>
    </BrowserRouter>
  );
};

describe("ItemDetail Component", () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    jest.clearAllTimers();
  });

  test("displays loading state initially", async () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    await act(async () => {
      renderWithRouter(<ItemDetail />);
    });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("displays item details after successful fetch", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItem,
    });

    await act(async () => {
      renderWithRouter(<ItemDetail />);
    });

    await waitFor(() => {
      expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
      expect(screen.getByText(/Category:/)).toBeInTheDocument();
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText(/Price:/)).toBeInTheDocument();
      expect(screen.getByText("$2499")).toBeInTheDocument();
    });
  });

  test("displays 404 error and redirects for non-existent item", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    jest.useFakeTimers();

    await act(async () => {
      renderWithRouter(<ItemDetail />);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Item not found. Redirecting...")
      ).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("displays generic error and redirects for other errors", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    jest.useFakeTimers();

    await act(async () => {
      renderWithRouter(<ItemDetail />);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Error fetching item. Redirecting...")
      ).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("displays generic error for non-404 HTTP errors", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    jest.useFakeTimers();

    await act(async () => {
      renderWithRouter(<ItemDetail />);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Error fetching item. Redirecting...")
      ).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("fetches item with correct ID from URL params", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItem,
    });

    await act(async () => {
      renderWithRouter(<ItemDetail />, { route: "/items/123" });
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/items/123");
    });
  });

  test("handles different item data formats", async () => {
    const itemWithDifferentPrice = {
      id: 2,
      name: "Headphones",
      category: "Audio",
      price: 399.99,
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => itemWithDifferentPrice,
    });

    await act(async () => {
      renderWithRouter(<ItemDetail />, { route: "/items/2" });
    });

    await waitFor(() => {
      expect(screen.getByText("Headphones")).toBeInTheDocument();
      expect(screen.getByText("Audio")).toBeInTheDocument();
      expect(screen.getByText("$399.99")).toBeInTheDocument();
    });
  });

  test("cleans up timeout on component unmount", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    jest.useFakeTimers();

    const { unmount } = renderWithRouter(<ItemDetail />);

    await waitFor(() => {
      expect(
        screen.getByText("Error fetching item. Redirecting...")
      ).toBeInTheDocument();
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
