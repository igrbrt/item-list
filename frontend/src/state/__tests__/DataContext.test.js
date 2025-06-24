import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { DataProvider, useData } from "../DataContext";

global.fetch = jest.fn();

const TestComponent = ({ onDataChange }) => {
  const data = useData();

  React.useEffect(() => {
    if (onDataChange) {
      onDataChange(data);
    }
  }, [data, onDataChange]);

  return (
    <div>
      <div data-testid="items-count">{data.items.length}</div>
      <div data-testid="total">{data.total}</div>
      <div data-testid="page">{data.page}</div>
      <div data-testid="limit">{data.limit}</div>
      <div data-testid="query">{data.q}</div>
      <div data-testid="loading">{data.loading.toString()}</div>
      <button data-testid="fetch-button" onClick={() => data.fetchItems()}>
        Fetch Items
      </button>
      <button data-testid="set-page-button" onClick={() => data.setPage(2)}>
        Set Page 2
      </button>
      <button data-testid="set-limit-button" onClick={() => data.setLimit(20)}>
        Set Limit 20
      </button>
      <button data-testid="set-query-button" onClick={() => data.setQ("test")}>
        Set Query
      </button>
    </div>
  );
};

describe("DataContext", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("provides initial state values", () => {
    let capturedData;
    const onDataChange = (data) => {
      capturedData = data;
    };

    render(
      <DataProvider>
        <TestComponent onDataChange={onDataChange} />
      </DataProvider>
    );

    expect(capturedData.items).toEqual([]);
    expect(capturedData.total).toBe(0);
    expect(capturedData.page).toBe(1);
    expect(capturedData.limit).toBe(10);
    expect(capturedData.q).toBe("");
    expect(capturedData.loading).toBe(false);
  });

  test("fetchItems updates state with API response", async () => {
    const mockResponse = {
      items: [{ id: 1, name: "Test Item" }],
      total: 1,
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    let capturedData;
    const onDataChange = (data) => {
      capturedData = data;
    };

    render(
      <DataProvider>
        <TestComponent onDataChange={onDataChange} />
      </DataProvider>
    );

    await act(async () => {
      screen.getByTestId("fetch-button").click();
    });

    await waitFor(() => {
      expect(capturedData.items).toEqual(mockResponse.items);
      expect(capturedData.total).toBe(mockResponse.total);
      expect(capturedData.loading).toBe(false);
    });

    expect(fetch).toHaveBeenCalledWith("/api/items?page=1&limit=10");
  });

  test("fetchItems with custom parameters", async () => {
    const mockResponse = {
      items: [{ id: 2, name: "Custom Item" }],
      total: 1,
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    let capturedData;
    const onDataChange = (data) => {
      capturedData = data;
    };

    render(
      <DataProvider>
        <TestComponent onDataChange={onDataChange} />
      </DataProvider>
    );

    await act(async () => {
      capturedData.fetchItems({ page: 2, limit: 5, q: "search" });
    });

    await waitFor(() => {
      expect(capturedData.items).toEqual(mockResponse.items);
      expect(capturedData.total).toBe(mockResponse.total);
      expect(capturedData.page).toBe(2);
      expect(capturedData.limit).toBe(5);
      expect(capturedData.q).toBe("search");
    });

    expect(fetch).toHaveBeenCalledWith("/api/items?page=2&limit=5&q=search");
  });

  test("fetchItems respects onlyIfActive option", async () => {
    const mockResponse = {
      items: [{ id: 1, name: "Test Item" }],
      total: 1,
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    let capturedData;
    const onDataChange = (data) => {
      capturedData = data;
    };

    render(
      <DataProvider>
        <TestComponent onDataChange={onDataChange} />
      </DataProvider>
    );

    await act(async () => {
      capturedData.fetchItems({ onlyIfActive: () => false });
    });

    await waitFor(() => {
      expect(capturedData.items).toEqual([]);
      expect(capturedData.total).toBe(0);
      expect(capturedData.loading).toBe(false);
    });
  });

  test("setPage updates page state", () => {
    let capturedData;
    const onDataChange = (data) => {
      capturedData = data;
    };

    render(
      <DataProvider>
        <TestComponent onDataChange={onDataChange} />
      </DataProvider>
    );

    act(() => {
      screen.getByTestId("set-page-button").click();
    });

    expect(capturedData.page).toBe(2);
  });

  test("setLimit updates limit state", () => {
    let capturedData;
    const onDataChange = (data) => {
      capturedData = data;
    };

    render(
      <DataProvider>
        <TestComponent onDataChange={onDataChange} />
      </DataProvider>
    );

    act(() => {
      screen.getByTestId("set-limit-button").click();
    });

    expect(capturedData.limit).toBe(20);
  });

  test("setQ updates query state", () => {
    let capturedData;
    const onDataChange = (data) => {
      capturedData = data;
    };

    render(
      <DataProvider>
        <TestComponent onDataChange={onDataChange} />
      </DataProvider>
    );

    act(() => {
      screen.getByTestId("set-query-button").click();
    });

    expect(capturedData.q).toBe("test");
  });

  test("loading state is set correctly during fetch", async () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    let capturedData;
    const onDataChange = (data) => {
      capturedData = data;
    };

    render(
      <DataProvider>
        <TestComponent onDataChange={onDataChange} />
      </DataProvider>
    );

    act(() => {
      screen.getByTestId("fetch-button").click();
    });

    expect(capturedData.loading).toBe(true);
  });

  test("fetchItems returns the API response", async () => {
    const mockResponse = {
      items: [{ id: 1, name: "Test Item" }],
      total: 1,
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockResponse,
    });

    let capturedData;
    const onDataChange = (data) => {
      capturedData = data;
    };

    render(
      <DataProvider>
        <TestComponent onDataChange={onDataChange} />
      </DataProvider>
    );

    let result;
    await act(async () => {
      result = await capturedData.fetchItems();
    });

    expect(result).toEqual(mockResponse);
  });

  test("fetchItems handles API errors gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("API Error"));

    let capturedData;
    const onDataChange = (data) => {
      capturedData = data;
    };

    render(
      <DataProvider>
        <TestComponent onDataChange={onDataChange} />
      </DataProvider>
    );

    await expect(async () => {
      await act(async () => {
        await capturedData.fetchItems();
      });
    }).rejects.toThrow("API Error");
  });

  test("useData throws error when used outside provider", () => {
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow();

    console.error = originalError;
  });
});
