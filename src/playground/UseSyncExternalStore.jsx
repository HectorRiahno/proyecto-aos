import React, { useSyncExternalStore } from "react";
import { Link } from "react-router-dom";

function UseSyncExternalStore() {
  const getSnapshot = () => {
    return navigator.onLine;
  };

  const subscribe = (listener) => {
    window.addEventListener("online", listener);
    window.addEventListener("offline", listener);

    return () => {
      window.removeEventListener("online", listener);
      window.removeEventListener("offline", listener);
    };
  };

  const isOnline = useSyncExternalStore(subscribe, getSnapshot);

  return (
    <div>
      Estado de conexión: {isOnline ? "Connected ✅" : "Disconnected ❌"}
      <Link to="/playground">Volver</Link>
    </div>
  );
}

export default UseSyncExternalStore;
