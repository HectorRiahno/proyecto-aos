import { useState, useDeferredValue } from "react";
import { Link } from "react-router-dom";

function UseDeferredValuePractice() {
  const [text, setText] = useState("");
  const deferredText = useDeferredValue(text);

  const list = [];
  for (let i = 0; i < 2000; i++) {
    list.push(deferredText);
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Hook: useDeferredValue</h1>
      <p>Retrasa la actualización de un valor pesado.</p>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe..."
      />

      <ul>
        {list.slice(0, 20).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      <Link to="/playground">Volver</Link>
    </div>
  );
}

export default UseDeferredValuePractice;