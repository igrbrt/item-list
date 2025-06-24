import React, { useEffect, useState } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";
import { FixedSizeList as List } from "react-window";

function Items() {
  const { items, total, page, limit, q, loading, setPage, setQ, fetchItems } =
    useData();
  const [search, setSearch] = useState(q);

  useEffect(() => {
    let active = true;
    fetchItems({ onlyIfActive: () => active, page, limit, q }).catch(
      console.error
    );
    return () => {
      active = false;
    };
  }, [fetchItems, page, limit, q]);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQ(search);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div
        style={{
          ...style,
          padding: 12,
          margin: "8px 0",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          display: "flex",
          alignItems: "center",
          transition: "box-shadow 0.2s",
          justifyContent: "space-between",
        }}
        className="item-card"
      >
        <Link
          to={"/items/" + item.id}
          style={{
            textDecoration: "none",
            color: "#222",
            fontWeight: 500,
            fontSize: 18,
            minWidth: "65%",
          }}
        >
          {item.name}
        </Link>
        <span style={{ color: "#888", fontSize: 14 }}>{item.category}</span>
        <span
          style={{
            color: "#1976d2",
            fontWeight: 600,
            minWidth: "15%",
            textAlign: "right",
          }}
        >
          $ {item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "32px auto",
        padding: 16,
        background: "#f7f9fa",
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
      }}
    >
      <form
        onSubmit={handleSearch}
        style={{ marginBottom: 24, display: "flex", gap: 8 }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by name..."
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: 8,
            fontSize: 16,
            outline: "none",
            transition: "border 0.2s",
          }}
        />
        <button
          type="submit"
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "0 20px",
            fontSize: 16,
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setQ("");
            setPage(1);
          }}
          style={{
            background: "#f5f5f5",
            color: "#666",
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: "0 20px",
            fontSize: 16,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Clear
        </button>
      </form>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div
            className="lds-dual-ring"
            data-testid="loading-spinner"
            style={{ display: "inline-block", width: 48, height: 48 }}
          />
          <style>{`.lds-dual-ring:after { content: ' '; display: block; width: 32px; height: 32px; margin: 8px; border-radius: 50%; border: 4px solid #1976d2; border-color: #1976d2 transparent #1976d2 transparent; animation: lds-dual-ring 1.2s linear infinite; } @keyframes lds-dual-ring { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : items.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888", fontSize: 18 }}>
          No items found.
        </p>
      ) : (
        <>
          <List
            height={400}
            itemCount={items.length}
            itemSize={64}
            width={"96%"}
            style={{ background: "transparent", overflow: "visible" }}
          >
            {Row}
          </List>
          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
            }}
          >
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              style={{
                background: page === 1 ? "#eee" : "#1976d2",
                color: page === 1 ? "#aaa" : "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                fontSize: 16,
                fontWeight: 500,
                cursor: page === 1 ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              ⬅ Previous
            </button>
            <span style={{ fontSize: 16, color: "#444" }}>
              Page <b>{page}</b> of <b>{totalPages}</b>
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages || totalPages === 0}
              style={{
                background:
                  page === totalPages || totalPages === 0 ? "#eee" : "#1976d2",
                color:
                  page === totalPages || totalPages === 0 ? "#aaa" : "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                fontSize: 16,
                fontWeight: 500,
                cursor:
                  page === totalPages || totalPages === 0
                    ? "not-allowed"
                    : "pointer",
                transition: "background 0.2s",
              }}
            >
              Next ➡
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Items;
