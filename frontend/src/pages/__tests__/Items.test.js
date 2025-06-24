import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { DataProvider } from "../../state/DataContext";
import Items from "../Items";

global.fetch = jest.fn();

const mockItems = {
  items: [
    { id: 1, name: "Laptop Pro", category: "Electronics", price: 2499 },
    { id: 2, name: "Headphones", category: "Electronics", price: 399 },
    { id: 3, name: "Monitor", category: "Electronics", price: 999 },
  ],
  total: 3,
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <DataProvider>{component}</DataProvider>
    </BrowserRouter>
  );
};

describe("Items Component", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("renders search input and loading state initially", async () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    await act(async () => {
      renderWithProviders(<Items />);
    });

    expect(
      screen.getByPlaceholderText("🔍 Search by name...")
    ).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("displays items after successful fetch", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    });

    await act(async () => {
      renderWithProviders(<Items />);
    });

    await waitFor(() => {
      expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
      expect(screen.getByText("Headphones")).toBeInTheDocument();
      expect(screen.getByText("Monitor")).toBeInTheDocument();
    });
  });

  test('shows "No items found" when no items', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    });

    await act(async () => {
      renderWithProviders(<Items />);
    });

    await waitFor(() => {
      expect(screen.getByText("No items found.")).toBeInTheDocument();
    });
  });

  test("performs search when form is submitted", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    });

    await act(async () => {
      renderWithProviders(<Items />);
    });

    await waitFor(() => {
      expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [mockItems.items[0]], total: 1 }),
    });

    const searchInput = screen.getByPlaceholderText("🔍 Search by name...");
    const searchButton = screen.getByText("Search");

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "Laptop" } });
      fireEvent.click(searchButton);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("q=Laptop"));
    });
  });

  test("clears search when clear button is clicked", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    });

    await act(async () => {
      renderWithProviders(<Items />);
    });

    await waitFor(() => {
      expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("🔍 Search by name...");
    const clearButton = screen.getByText("Clear");

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "Laptop" } });
      fireEvent.click(clearButton);
    });

    expect(searchInput.value).toBe("");
  });

  test("displays pagination controls when there are items", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: mockItems.items, total: 3 }),
    });

    await act(async () => {
      renderWithProviders(<Items />);
    });

    await waitFor(() => {
      expect(screen.getByText("⬅ Previous")).toBeInTheDocument();
      expect(screen.getByText("Next ➡")).toBeInTheDocument();
      expect(screen.getByText(/Page/)).toBeInTheDocument();
      const pageNumbers = screen.getAllByText("1");
      expect(pageNumbers.length).toBeGreaterThan(0);
    });
  });

  test("disables pagination buttons appropriately", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: mockItems.items, total: 3 }),
    });

    await act(async () => {
      renderWithProviders(<Items />);
    });

    await waitFor(() => {
      const prevButton = screen.getByText("⬅ Previous");
      const nextButton = screen.getByText("Next ➡");

      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });
  });

  test("handles fetch error gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    await act(async () => {
      renderWithProviders(<Items />);
    });

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("displays item details correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItems,
    });

    await act(async () => {
      renderWithProviders(<Items />);
    });

    await waitFor(() => {
      expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
      const electronicsElements = screen.getAllByText("Electronics");
      expect(electronicsElements.length).toBeGreaterThan(0);
      expect(screen.getByText("$ 2,499.00")).toBeInTheDocument();
    });
  });
});
