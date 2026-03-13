import { useReducer } from "react";
import { Link } from "react-router-dom";

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD": return [...state, { id: Date.now(), text: action.payload, completed: false }];
    case "TOGGLE": return state.map(t => t.id === action.payload ? { ...t, completed: !t.completed } : t);
    case "DELETE": return state.filter(t => t.id !== action.payload);
    default: return state;
  }
}

function UseReducerPractice() {
  const [state, dispatch] = useReducer(reducer, [])

  return (
    <div style={{ padding: "20px" }}>
      <header>
        <h1>Hook: useReducer</h1>
        <p>
          Descripción: Maneja estados complejos usando una función reductora.
        </p>
      </header>

      <div className="main-content">
        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Nueva tarea"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value) {
                  dispatch({ type: "ADD", payload: e.target.value });
                  e.target.value = "";
                }
              }}
              style={{ padding: "8px", flex: 1, borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {state.map((todo) => (
              <li key={todo.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px", borderBottom: "1px solid #eee" }}>
                <span style={{ textDecoration: todo.completed ? "line-through" : "none" }}>{todo.text}</span>
                <div style={{ display: "flex", gap: "5px" }}>
                  <button onClick={() => dispatch({ type: "TOGGLE", payload: todo.id })} className="btn-ejemplo" style={{ fontSize: "0.8rem", padding: "4px 8px" }}>Ok</button>
                  <button onClick={() => dispatch({ type: "DELETE", payload: todo.id })} className="btn-ejemplo" style={{ fontSize: "0.8rem", padding: "4px 8px", backgroundColor: "#ff4d4f" }}>X</button>
                </div>
              </li>
            ))}
          </ul>
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

export default UseReducerPractice
