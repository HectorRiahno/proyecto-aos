import { use } from "react";
import { Link } from "react-router-dom";

const fetchUser = fetch("https://jsonplaceholder.typicode.com/users/3").then(
  (res) => res.json(),
);

function Use() {
  const user = use(fetchUser);

  return (
    <div>
      <h2>Usuario</h2>
      <p>Nombre: {user.name}</p>
      <p>Email: {user.email}</p>

      <Link to="/playground">Volver</Link>
    </div>
  );
}

export default Use;
