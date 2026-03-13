import { useState, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";

function UseLayoutEffectPractice() {
  const [width, setWidth] = useState(0);
  const boxRef = useRef();

  useLayoutEffect(() => {
    setWidth(boxRef.current.offsetWidth);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Hook: useLayoutEffect</h1>

      <div
        ref={boxRef}
        style={{
          width: "300px",
          padding: "20px",
          background: "#eee",
        }}
      >
        Caja
      </div>

      <p>Ancho detectado: {width}px</p>

      <Link to="/playground">Volver</Link>
    </div>
  );
}

export default UseLayoutEffectPractice;