import React, { useState, useOptimistic } from "react";
import { Link } from "react-router-dom";

function UseOptimistic() {
  const [comments, setComments] = useState([]);

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (currentComments, newComment) => [
      ...currentComments,
      { text: newComment, sending: true }
    ]
  );

  const handleAddComment = async () => {
    const text = "Nuevo comentario";

    // UI se actualiza inmediatamente
    addOptimisticComment(text);

    // simulamos petición al servidor
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // cuando el servidor responde guardamos el comentario real
    setComments((prev) => [...prev, { text, sending: false }]);
  };

  return (
    <div>
      <h2>Comentarios</h2>

      <button onClick={handleAddComment}>
        Agregar comentario
      </button>

      <ul>
        {optimisticComments.map((c, i) => (
          <li key={i}>
            {c.text} {c.sending && "⏳ Enviando..."}
          </li>
        ))}
      </ul>

       <Link to="/playground">Volver</Link>
    </div>
  );
}

export default UseOptimistic;