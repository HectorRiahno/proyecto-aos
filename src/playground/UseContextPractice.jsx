import { createContext, useContext } from "react";
import { Link } from "react-router-dom";

const ThemeContext = createContext("light");

function ChildComponent() {
  const theme = useContext(ThemeContext);

  return (
    <div
      style={{
        padding: "15px",
        marginTop: "10px",
        borderRadius: "8px",
        background: "#f0f0f0",
      }}
    >
      <h3>Componente Hijo</h3>
      <p>
        Este componente obtiene el valor del contexto usando{" "}
        <code>useContext</code>.
      </p>

      <p>
        Tema actual desde el contexto: <b>{theme}</b>
      </p>
    </div>
  );
}

function UseContextPractice() {
  return (
    <ThemeContext.Provider value="dark">
      <div style={{ padding: "20px" }}>
        <header>
          <h1>Hook: useContext</h1>
          <p>
            <b>useContext</b> permite acceder a datos globales dentro de un
            componente sin necesidad de pasar <code>props</code> manualmente a
            través de múltiples niveles de componentes.
          </p>
        </header>

        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "8px",
            marginTop: "20px",
          }}
        >
          <h2>Ejemplo</h2>

          <p>
            En este ejemplo se crea un contexto llamado{" "}
            <code>ThemeContext</code> que tiene el valor <b>"dark"</b>.
          </p>

          <p>
            El componente hijo puede acceder directamente a este valor usando{" "}
            <code>useContext</code>, sin necesidad de recibirlo como prop.
          </p>

          <ChildComponent />
        </div>

        <footer style={{ marginTop: "20px" }}>
          <Link to="/playground" className="btn-ejemplo">
            Volver al Home
          </Link>
        </footer>
      </div>
    </ThemeContext.Provider>
  );
}

export default UseContextPractice;