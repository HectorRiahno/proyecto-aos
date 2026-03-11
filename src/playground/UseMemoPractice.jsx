import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function UseMemoPractice() {
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(0);

  const items = useMemo(() => {
    return Array.from({ length: 1000 }, (_, i) => `Elemento ${i}`).filter(item =>
      item.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div style={{ padding: "20px" }}>
      <header>
        <h1>Hook: useMemo</h1>
        <p>
          Descripción: Memoriza valores calculados para mejorar el rendimiento.
        </p>
      </header>

      <div className="main-content">
        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Filtrar 1000 elementos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px", width: "100%", borderRadius: "4px", border: "1px solid #ccc", marginBottom: "10px" }}
            />
            <button className="btn-ejemplo" onClick={() => setCount(count + 1)}>
              Renderizar Componente (Contador: {count})
            </button>
          </div>
          <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "10px" }}>
            La lista de abajo solo se recalcula cuando el filtro cambia, no cuando el contador incrementa.
          </p>
          <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #eee", padding: "10px" }}>
            {items.map((item, idx) => (
              <div key={idx}>{item}</div>
            ))}
          </div>
        </div>
      </div>

      <footer>
        <Link to="/playground" className="btn-ejemplo">
          Volver al Home
        </Link>
      </footer>
    </div>
  );
}

export default UseMemoPractice
