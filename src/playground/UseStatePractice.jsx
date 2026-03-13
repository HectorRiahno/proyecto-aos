import { useState } from "react";
import { Link } from "react-router-dom";

function UseStatePractice() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: "20px" }}>
      <header>
        <h1>Hook: useState</h1>
        <p>
          Descripción: Permite manejar el estado dentro de un componente
          funcional.
        </p>
      </header>

      <div className="main-content">
        <div style={{ textAlign: "center", border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <h2>Contador: {count}</h2>
          <div style={{ marginTop: "10px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <button className="btn-ejemplo" onClick={() => setCount(count + 1)}>Incrementar</button>
            <button className="btn-ejemplo" onClick={() => setCount(count - 1)}>Decrementar</button>
            <button className="btn-ejemplo" style={{ backgroundColor: "#ff4d4f" }} onClick={() => setCount(0)}>Resetear</button>
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

export default UseStatePractice
