import { useId, useState } from "react";
import { Link } from "react-router-dom";

function UseId() {
  const nameId = useId();
  const hintId = useId();
  const errorId = useId();

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleBlur = () => {
    if (name.trim() === "") {
      setError("El nombre es obligatorio");
    } else {
      setError("");
    }
  };

  return (
    <div style={{ maxWidth: 300 }}>
      <label htmlFor={nameId}>Nombre</label>

      <input
        id={nameId}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleBlur}
        aria-describedby={`${hintId} ${error ? errorId : ""}`}
      />

      <p id={hintId} style={{ fontSize: "12px" }}>
        Escribe tu nombre completo
      </p>

      {error && (
        <p id={errorId} style={{ color: "red", fontSize: "12px" }}>
          {error}
        </p>
      )}

       <Link to="/playground">Volver</Link>
    </div>
  );
}

export default UseId;