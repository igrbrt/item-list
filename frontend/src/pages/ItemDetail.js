import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId;

    fetch("/api/items/" + id)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then(setItem)
      .catch(async (err) => {
        let msg = "Error fetching item.";
        if (err.status === 404) msg = "Item not found.";
        setError(msg);
        timeoutId = setTimeout(() => navigate("/"), 2000);
      });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [id, navigate]);

  if (error)
    return (
      <p style={{ color: "red", textAlign: "center" }}>
        {error} Redirecting...
      </p>
    );
  if (!item) return <p>Loading...</p>;

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        padding: 32,
        background: "#f7f9fa",
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 600,
          marginBottom: 16,
          color: "#222",
        }}
      >
        {item.name}
      </h2>
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          gap: 24,
        }}
      >
        <span style={{ color: "#888", fontSize: 16, fontWeight: 500 }}>
          {item.category}
        </span>
        <span
          style={{
            color: "#1976d2",
            fontWeight: 600,
            fontSize: 20,
            marginLeft: "auto",
            minWidth: 120,
            textAlign: "right",
          }}
        >
          $ {item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

export default ItemDetail;
