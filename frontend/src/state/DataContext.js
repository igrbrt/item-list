import React, { createContext, useCallback, useContext, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(
    async (options = {}) => {
      const currPage = options.page ?? page;
      const currLimit = options.limit ?? limit;
      const currQ = options.q ?? q;
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", currPage);
      params.append("limit", currLimit);
      if (currQ) params.append("q", currQ);
      const res = await fetch(`/api/items?${params.toString()}`);
      const json = await res.json();
      if (!options.onlyIfActive || options.onlyIfActive()) {
        setItems(json.items);
        setTotal(json.total);
        setPage(currPage);
        setLimit(currLimit);
        setQ(currQ);
      }
      setLoading(false);
      return json;
    },
    [page, limit, q]
  );

  return (
    <DataContext.Provider
      value={{
        items,
        total,
        page,
        limit,
        q,
        loading,
        setPage,
        setLimit,
        setQ,
        fetchItems,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
