import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { LogOut, LogIn, Search, Mail, Hospital } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

function SessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    // Escuchar cambios en tiempo real
    const unsubscribeSessions = onSnapshot(collection(db, "sessions"), (sessionSnapshot) => {
      const sessionData = sessionSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // También obtenemos los usuarios para completar fotos faltantes
      onSnapshot(collection(db, "users"), (userSnapshot) => {
        const userData = {};
        userSnapshot.docs.forEach(doc => {
          userData[doc.data().email] = doc.data().photoURL;
        });

        const mergedData = sessionData.map(session => ({
          ...session,
          // Si la sesión no tiene foto, la buscamos por email en la colección de usuarios
          photoURL: session.photoURL || userData[session.email] || ""
        }));

        // Ordenar por fecha más reciente
        mergedData.sort((a, b) => {
          const timeA = a.loginTime?.toDate?.() || a.loginTime || new Date(0);
          const timeB = b.loginTime?.toDate?.() || b.loginTime || new Date(0);
          return timeB - timeA;
        });

        setSessions(mergedData);
      });
    }, (error) => {
      console.error("Error al obtener sesiones:", error);
    });

    return () => unsubscribeSessions();
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

  // Paginación
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Resetear página al cambiar filtros
  const handleSearchChange = (value) => { setSearch(value); setCurrentPage(1); };
  const handleFilterChange = (value) => { setFilterType(value); setCurrentPage(1); };

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
      correo: "bg-blue-50 text-blue-700 border-blue-200",
      google: "bg-red-50 text-red-700 border-red-200",
      facebook: "bg-indigo-50 text-indigo-700 border-indigo-200",
      github: "bg-gray-100 text-gray-700 border-gray-300"
    };
    return colors[provider] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  // Función para obtener color según estado
  const getStatusColor = (status) => {
    return status === "activa" 
      ? "bg-green-100 text-green-800" 
      : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Hospital size={18} />
            </div>
            <h1 className="text-xl font-bold text-blue-600">HospitalIS PRO</h1>
          </div>
          <h2 className="text-3xl font-bold text-slate-700">Historial de Sesiones</h2>
          <p className="text-slate-500 mt-1">Seguimiento de accesos de usuarios a la aplicación</p>
        </div>
        
        <button 
          onClick={() => navigate('/Home')}
          className="bg-slate-200 hover:bg-slate-300 transition px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border border-gray-300"
        >
          Volver al Home
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 border border-gray-300 rounded-xl mb-6 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Buscar Sesión
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por email, usuario o método..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Estado
          </label>
          <select
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer text-slate-700 bg-white"
          >
            <option value="todos">Todos los estados</option>
            <option value="activa">Sesiones Activas</option>
            <option value="finalizada">Sesiones Finalizadas</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-500 rounded-xl overflow-hidden">
        {filteredSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-gray-500">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Método</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Entrada</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Salida</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Duración</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-100 transition border-b border-gray-500 last:border-0">
                    <td className="px-6 py-4 text-sm text-slate-600">{session.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <div className="flex items-center gap-3">
                        {session.photoURL ? (
                          <img 
                            src={session.photoURL} 
                            alt="" 
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full border border-gray-300 shadow-sm" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-200">
                            {session.username?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="font-medium">{session.username || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getProviderColor(session.provider)}`}>
                        {session.provider === 'google' ? (
                          <FcGoogle className="w-3.5 h-3.5" />
                        ) : session.provider === 'github' ? (
                          <FaGithub className="w-3.5 h-3.5" />
                        ) : (
                          <Mail className="w-3.5 h-3.5" />
                        )}
                        <span>{session.provider?.charAt(0).toUpperCase() + session.provider?.slice(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <LogIn className="w-4 h-4 text-green-500" />
                        {formatDate(session.loginTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {session.logoutTime ? (
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4 text-red-500" />
                          {formatDate(session.logoutTime)}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                      {calculateDuration(session.loginTime, session.logoutTime)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(session.status)}`}>
                        {session.status?.charAt(0).toUpperCase() + session.status?.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-slate-500 text-lg font-medium">No se encontraron sesiones registradas</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Mostrando <span className="font-semibold text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> – <span className="font-semibold text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredSessions.length)}</span> de <span className="font-semibold text-slate-700">{filteredSessions.length}</span> sesiones
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              ← Anterior
            </button>
            <span className="text-sm text-slate-600 px-2">
              Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default SessionsPage;