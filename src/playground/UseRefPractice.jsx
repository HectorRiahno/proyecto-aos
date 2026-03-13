import { useRef } from "react";
import { Link } from "react-router-dom";

function UseRefPractice() {
  const inputRef = useRef(null)
  const renderCount = useRef(0)

  renderCount.current += 1

  const focusInput = () => {
    inputRef.current.focus()
  }

  return (
    <div style={{ padding: "20px" }}>
      <header>
        <h1>Hook: useRef</h1>
        <p>
          Descripción: Permite crear referencias persistentes a elementos del
          DOM o valores.
        </p>
      </header>

      <div className="main-content">
        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <div style={{ marginBottom: "20px" }}>
            <input ref={inputRef} placeholder="Escribe algo..." style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", marginRight: "10px" }} />
            <button className="btn-ejemplo" onClick={focusInput}>Enfocar Input</button>
          </div>
          <div style={{ padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
            <p>Este componente se ha renderizado: <strong>{renderCount.current}</strong> veces.</p>
            <p style={{ fontSize: "0.8rem", color: "#666" }}>La referencia del contador persiste sin causar nuevos renders.</p>
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

export default UseRefPractice
