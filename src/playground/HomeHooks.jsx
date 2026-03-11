import { Link } from "react-router-dom";

const hooksData = [
  {
    name: "useDebugValue",
    description:
      "Muestra información adicional en React DevTools para debugging.",
    category: "Debug",
    path: "/playground/useDebugValue",
  },
  {
    name: "useState",
    description: "Maneja el estado dentro de un componente funcional.",
    category: "Estado",
    path: "/playground/useState",
  },
  {
    name: "useReducer",
    description: "Maneja estados complejos usando una función reductora.",
    category: "Estado",
    path: "/playground/useReducer",
  },
  {
    name: "useRef",
    description:
      "Permite crear referencias persistentes a elementos del DOM o valores.",
    category: "Referencias",
    path: "/playground/useRef",
  },
  {
    name: "useImperativeHandle",
    description:
      "Permite personalizar la referencia expuesta a componentes padres.",
    category: "Referencias",
    path: "/playground/useImperativeHandle",
  },
  {
    name: "useMemo",
    description: "Memoriza valores calculados para mejorar el rendimiento.",
    category: "Performance",
    path: "/playground/useMemo",
  },
  {
    name: "useCallback",
    description: "Memoriza funciones para evitar recrearlas en cada render.",
    category: "Performance",
    path: "/playground/useCallback",
  },
];

function HomeHooks() {
  return (
    <div>
      <header>
        <h1>Ejemplos de Hooks en React</h1>
      </header>

      <div className="main-content">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Hook</th>
                <th>Ruta</th>
                <th>Descripción</th>
                <th>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {hooksData.map((hook, index) => (
                <tr key={index}>
                  <td>
                    <code>{hook.name}</code>
                  </td>
                  <td>
                    <Link to={hook.path} className="btn-ejemplo">
                      Ir a ejemplo
                    </Link>
                  </td>
                  <td>{hook.description}</td>
                  <td>
                    <span className="category-tag">{hook.category}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HomeHooks
