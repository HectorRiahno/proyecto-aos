import React from "react";
import { useFormStatus } from "react-dom";
import { Link } from "react-router-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Enviando..." : "Enviar"}
    </button>
  );
}

function UseFormStatus() {
  async function submitForm(formData) {
    const name = formData.get("name");

    // simulamos una petición al servidor
    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert(`Formulario enviado por: ${name}`);
  }

  return (
    <>
      <form action={submitForm}>
        <input type="text" name="name" placeholder="Nombre" />
        <SubmitButton />
      </form>

      <Link to="/playground">Volver</Link>
    </>
  );
}

export default UseFormStatus;
