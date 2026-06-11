import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Hospital } from "lucide-react";

function Home() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const initial = user?.email?.charAt(0).toUpperCase();

  if (loading) {
    return <h1 className="text-center mt-10 text-xl">Cargando...</h1>;
  }

  const cards = [
    {
      title: "Pacientes",
      description: "Gestiona la información de los pacientes.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      cardBg: "bg-blue-600 hover:bg-blue-700 text-white",
      iconBg: "bg-white/20 text-white",
      descColor: "text-blue-100",
      arrowColor: "text-blue-200 group-hover:text-white",
      onClick: () => navigate('/patients'),
    },
    {
      title: "Citas",
      description: "Agenda y controla citas médicas.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
          <line x1="16" x2="16" y1="2" y2="6"/>
          <line x1="8" x2="8" y1="2" y2="6"/>
          <line x1="3" x2="21" y1="10" y2="10"/>
          <path d="m9 16 2 2 4-4"/>
        </svg>
      ),
      cardBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
      iconBg: "bg-white/20 text-white",
      descColor: "text-emerald-100",
      arrowColor: "text-emerald-200 group-hover:text-white",
      onClick: null,
    },
    {
      title: "Médicos",
      description: "Consulta y gestiona el personal médico.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.8 2.3A7.5 7.5 0 0 0 2 8.5C2 12.6 5.4 16 9.5 16c3.1 0 5.8-1.9 6.9-4.7"/>
          <path d="M22 10.5V12a3 3 0 0 1-3 3h-2.5"/>
          <path d="M12 2v3m0 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0Z"/>
          <path d="M12 12V8.5a1.5 1.5 0 0 0-3 0v3"/>
        </svg>
      ),
      cardBg: "bg-violet-600 hover:bg-violet-700 text-white",
      iconBg: "bg-white/20 text-white",
      descColor: "text-violet-100",
      arrowColor: "text-violet-200 group-hover:text-white",
      onClick: () => navigate('/doctors'),
    },
    {
      title: "Usuarios",
      description: "Gestionar las cuentas y perfiles de los usuarios.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      cardBg: "bg-amber-500 hover:bg-amber-600 text-white",
      iconBg: "bg-white/20 text-white",
      descColor: "text-amber-100",
      arrowColor: "text-amber-200 group-hover:text-white",
      onClick: () => navigate('/users'),
    },
    {
      title: "Auditoría",
      description: "Ver el historial de auditoría de los usuarios.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      cardBg: "bg-rose-600 hover:bg-rose-700 text-white",
      iconBg: "bg-white/20 text-white",
      descColor: "text-rose-100",
      arrowColor: "text-rose-200 group-hover:text-white",
      onClick: () => navigate('/sessions'),
    },
    {
      title: "Mi Perfil",
      description: "Ver y editar tu información personal.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      cardBg: "bg-sky-600 hover:bg-sky-700 text-white",
      iconBg: "bg-white/20 text-white",
      descColor: "text-sky-100",
      arrowColor: "text-sky-200 group-hover:text-white",
      onClick: () => navigate('/profile'),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <Hospital size={18} />
          </div>
          <h1 className="text-xl font-bold text-blue-600">HospitalIS PRO</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-slate-800 font-semibold text-sm">
              {user?.username || user?.displayName || 'Usuario'}
            </span>
            <span className="text-slate-500 text-xs">
              {user?.email}
            </span>
          </div>

          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="usuario"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              {initial}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="p-6">
        <h2 className="text-2xl font-semibold text-slate-700 mb-6">
          Bienvenido, {user?.username || user?.displayName || 'Usuario'} 👋
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={card.onClick || undefined}
              className={`group ${card.cardBg} p-5 rounded-xl border border-black/10 transition-all duration-200 ${
                card.onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : 'opacity-60 cursor-default'
              }`}
            >
              {/* Ícono + flecha */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  {card.icon}
                </div>
                {card.onClick && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-colors ${card.arrowColor}`}
                  >
                    <path d="M7 17L17 7"/>
                    <path d="M7 7h10v10"/>
                  </svg>
                )}
              </div>

              {/* Texto */}
              <h3 className="text-sm font-bold">
                {card.title}
              </h3>
              <p className={`text-xs mt-0.5 ${card.descColor}`}>
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Home;