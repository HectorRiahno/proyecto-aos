import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { LogOut, LogIn, Search } from "lucide-react";

function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("todos"); // todos, activas, finalizadas

  useEffect(() => {
    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(collection(db, "sessions"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Ordenar por fecha más reciente
      data.sort((a, b) => {
        const timeA = a.loginTime?.toDate?.() || a.loginTime || new Date(0);
        const timeB = b.loginTime?.toDate?.() || b.loginTime || new Date(0);
        return timeB - timeA;
      });

      setSessions(data);
    }, (error) => {
      console.error("Error al obtener sesiones:", error);
    });

    return () => unsubscribe();
  }, []);

  // Filtrar sesiones
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = 
      (s.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (s.username?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (s.provider?.toLowerCase() || "").includes(search.toLowerCase());

    const matchesStatus = 
      filterType === "todos" || s.status === filterType;

    return matchesSearch && matchesStatus;
  });

  // Función para formatear fecha
  const formatDate = (date) => {
    if (!date) return "—";
    const d = date?.toDate?.() || date;
    return new Date(d).toLocaleString("es-ES");
  };

  // Función para calcular duración
  const calculateDuration = (loginTime, logoutTime) => {
    if (!loginTime) return "—";
    
    const start = loginTime?.toDate?.() || new Date(loginTime);
    const end = logoutTime?.toDate?.() || (logoutTime ? new Date(logoutTime) : new Date());
    
    const diffMs = end - start;
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`;
    return `${Math.floor(diffSeconds / 3600)}h ${Math.floor((diffSeconds % 3600) / 60)}m`;
  };

  // Función para obtener color según método
  const getProviderColor = (provider) => {
    const colors = {
      correo: "bg-blue-100 text-blue-800",
      google: "bg-red-100 text-red-800",
      facebook: "bg-blue-600 text-white",
      github: "bg-gray-800 text-white"
    };
    return colors[provider] || "bg-gray-100 text-gray-800";
  };

  // Función para obtener color según estado
  const getStatusColor = (status) => {
    return status === "activa" 
      ? "bg-green-100 text-green-800" 
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Historial de Sesiones</h1>
        <p className="text-gray-600">Seguimiento de accesos de usuarios a la aplicación</p>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          {/* Buscador */}
          {/* <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por email, usuario o método..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div> */}

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="activa">Activas</option>
              <option value="finalizada">Finalizadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Usuario</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Método</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Entrada</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Salida</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Duración</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-800">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">{session.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{session.username || "—"}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getProviderColor(session.provider)}`}>
                        {session.provider?.charAt(0).toUpperCase() + session.provider?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <LogIn className="w-4 h-4 text-green-500" />
                        {formatDate(session.loginTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {session.logoutTime ? (
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4 text-red-500" />
                          {formatDate(session.logoutTime)}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {calculateDuration(session.loginTime, session.logoutTime)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(session.status)}`}>
                        {session.status?.charAt(0).toUpperCase() + session.status?.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">No hay sesiones registradas</p>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total de Sesiones</h3>
            <p className="text-2xl font-bold text-gray-800">{sessions.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Sesiones Activas</h3>
            <p className="text-2xl font-bold text-green-600">{sessions.filter(s => s.status === "activa").length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Sesiones Finalizadas</h3>
            <p className="text-2xl font-bold text-gray-800">{sessions.filter(s => s.status === "finalizada").length}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionsPage;