import { useCallback, useState, memo } from "react";
import { Link } from "react-router-dom";

const DisplayCount = memo(({ increment }) => {
  console.log("Hijo Renderizado");
  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#f0f0f0",
        borderRadius: "4px",
        marginTop: "10px",
      }}
    >
      <p>Componente Hijo (Memoizado)</p>
      <button className="btn-ejemplo" onClick={increment}>
        Incrementar desde el Hijo
      </button>
    </div>
  );
});

function UseCallbackPractice() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  const increment = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <header>
        <h1>Hook: useCallback</h1>
        <p>
          Descripción: Memoriza funciones para evitar recrearlas en cada render.
        </p>
      </header>

      <div className="main-content">
        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h2>Contador: {count}</h2>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe algo para renderizar el padre..."
            style={{
              padding: "8px",
              width: "100%",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginBottom: "10px",
            }}
          />
          <p style={{ fontSize: "0.8rem", color: "#666" }}>
            Al escribir arriba, el padre se renderiza, pero el hijo NO se vuelve
            a renderizar porque la función <code>increment</code> está
            memorizada.
          </p>
          <DisplayCount increment={increment} />
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

export default UseCallbackPractice;
