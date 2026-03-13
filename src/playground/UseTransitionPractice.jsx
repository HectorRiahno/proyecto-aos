import { useState, useTransition } from "react";
import { Link } from "react-router-dom";

function UseTransitionPractice() {
  const [text, setText] = useState("");
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    startTransition(() => {
      const newList = [];
      for (let i = 0; i < 5000; i++) {
        newList.push(value);
      }
      setList(newList);
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Hook: useTransition</h1>
      <p>Permite manejar actualizaciones no urgentes.</p>

      <input
        value={text}
        onChange={handleChange}
        placeholder="Escribe algo..."
      />

      {isPending && <p>Cargando lista...</p>}

      <ul>
        {list.slice(0, 20).map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <Link to="/playground">Volver</Link>
    </div>
  );
}

export default UseTransitionPractice;