import { useInsertionEffect } from "react";
import { Link } from "react-router-dom";

function UseInsertionEffectPractice() {

  useInsertionEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .dynamic-style {
        color: red;
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Hook: useInsertionEffect</h1>

      <p className="dynamic-style">
        Este texto recibe estilo insertado antes del render.
      </p>

      <Link to="/playground">Volver</Link>
    </div>
  );
}

export default UseInsertionEffectPractice;