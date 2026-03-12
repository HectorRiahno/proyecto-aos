import { useDebugValue, useState } from "react";
import { Link } from "react-router-dom";

function useCustomHook() {
  const [status, setStatus] = useState("online");
  useDebugValue(status === "online" ? "En Línea" : "Desconectado");
  return [status, setStatus];
}

function UseDebugValuePractice() {
  const [status, setStatus] = useCustomHook();

  return (
    <div style={{ padding: "20px" }}>
      <header>
        <h1>Hook: useDebugValue</h1>
        <p>
          Descripción: Muestra información adicional en React DevTools para
          debugging.
        </p>
      </header>

      <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }} className="main-content">
        <p>
          Estado actual: <strong>{status}</strong>
        </p>
        <button className="btn-ejemplo" onClick={() => setStatus(status === "online" ? "offline" : "online")}>
          Cambiar Estado
        </button>
      </div>

      <footer>
        <Link to="/playground" className="btn-ejemplo">
          Volver al Home
        </Link>
      </footer>
    </div>
  );
}

export default UseDebugValuePractice
