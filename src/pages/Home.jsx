import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogIn, Hospital } from "lucide-react";

function Home() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();


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

  return (
    <div className="min-h-screen bg-slate-100">
      
      <header className="bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <Hospital size={18} />
          </div>
          <h1 className="text-xl font-bold text-blue-600">HospitalIS PRO</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-600 hidden sm:block">
            {user.email}
          </span>

          {user.photoURL ? (
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
          Bienvenido 👋
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-5 rounded-xl border border-gray-300 hover:border-gray-500 transition cursor-pointer">
            <h3 className="text-lg font-semibold text-slate-700">
              Pacientes
            </h3>
            <p className="text-slate-500 text-sm mt-2">
              Gestiona la información de los pacientes.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-300 hover:border-gray-500 transition cursor-pointer">
            <h3 className="text-lg font-semibold text-slate-700">
              Citas
            </h3>
            <p className="text-slate-500 text-sm mt-2">
              Agenda y controla citas médicas.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-300 hover:border-gray-500 transition cursor-pointer">
            <h3 className="text-lg font-semibold text-slate-700">
              Historias Clínicas
            </h3>
            <p className="text-slate-500 text-sm mt-2">
              Consulta y registra historiales médicos.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-300 hover:border-gray-500 transition cursor-pointer" >
            <h3 className="text-lg font-semibold text-slate-700">
              Sesiones
            </h3>
            <p className="text-slate-500 text-sm mt-2">
              Ver el historial de sesiones de los usuarios. <a href="/sessions" className="text-blue-500 hover:underline">
                haz clic aquí
              </a>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Home;