import React, { useActionState } from "react";
import { Link } from "react-router-dom";
function UseActionState() {

  async function submitForm(prevState, formData) {
    const name = formData.get("name");

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (!name) {
      return { message: "El nombre es obligatorio" };
    }

    return { message: `Usuario ${name} registrado correctamente` };
  }

  const [state, formAction] = useActionState(submitForm, { message: "" });

  return (
    <div>
      <h2>Registro</h2>

      <form action={formAction}>
        <input type="text" name="name" placeholder="Nombre" />
        <button type="submit">Enviar</button>
      </form>

      <p>{state.message}</p>

      <Link to="/playground">Volver</Link>
    </div>
  );
}

export default UseActionState;