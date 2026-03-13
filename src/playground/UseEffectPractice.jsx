import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function UseEffectPractice() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("El componente se renderizó");

    return () => {
      console.log("Limpieza antes del siguiente render");
    };
  }, [count]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Hook: useEffect</h1>
      <p>Ejecuta efectos después del render.</p>

      <h2>{count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Incrementar
      </button>

      <Link to="/playground">Volver</Link>
    </div>
  );
}

export default UseEffectPractice;