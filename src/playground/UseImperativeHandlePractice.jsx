import { useImperativeHandle, useRef, forwardRef, useState } from "react";
import { Link } from "react-router-dom";

const CustomInput = forwardRef((props, ref) => {
  const [value, setValue] = useState("");
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => setValue(""),
    getValue: () => value
  }));

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "100%", marginBottom: "10px" }}
      placeholder="Input personalizado..."
    />
  );
});

function UseImperativeHandlePractice() {
  const customInputRef = useRef();

  return (
    <div style={{ padding: "20px" }}>
      <header>
        <h1>Hook: useImperativeHandle</h1>
        <p>
          Descripción: Permite personalizar la referencia expuesta a componentes
          padres.
        </p>
      </header>

      <div className="main-content">
        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <CustomInput ref={customInputRef} />
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button className="btn-ejemplo" onClick={() => customInputRef.current.focus()}>Foco desde el Padre</button>
            <button className="btn-ejemplo" style={{ backgroundColor: "#ff4d4f" }} onClick={() => customInputRef.current.clear()}>Limpiar desde el Padre</button>
          </div>
          <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>
            Aquí el padre controla acciones internas del hijo a través de una referencia personalizada.
          </p>
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

export default UseImperativeHandlePractice
