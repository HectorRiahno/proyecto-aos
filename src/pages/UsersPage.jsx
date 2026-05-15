import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Search, User, Mail, Hospital, Phone, CreditCard, Calendar, Edit2, Trash2, Plus, X, Shield, UserCheck, UserMinus } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaFacebook } from "react-icons/fa";

function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Estados para el Modal (CRUD)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    telephone: "",
    document: "",
    role: "user",
    status: "activo"
  });
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      userData.sort((a, b) => {
        const nameA = a.username?.toLowerCase() || "";
        const nameB = b.username?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
      });

      setUsers(userData);
    }, (error) => {
      console.error("Error al obtener usuarios:", error);
    });

    return () => unsubscribeUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const term = search.toLowerCase();
    const matchesSearch = 
      (u.email?.toLowerCase() || "").includes(term) ||
      (u.username?.toLowerCase() || "").includes(term) ||
      (u.document?.toLowerCase() || "").includes(term) ||
      (u.status?.toLowerCase() || "").includes(term) ||
      (u.loginMethod?.toLowerCase() || "").includes(term) ||
      (u.loginMethods?.some(m => m.toLowerCase().includes(term)));

    const matchesRole = 
      filterRole === "todos" || u.role === filterRole;

    const matchesStatus = 
      filterStatus === "todos" || u.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    const d = date?.toDate?.() || date;
    return new Date(d).toLocaleDateString("es-ES");
  };

  // Funciones de estilo heredadas de Historial
  const getProviderColor = (provider) => {
    const colors = {
      correo:   "bg-blue-50 text-blue-700 border-blue-200",
      google:   "bg-red-50 text-red-700 border-red-200",
      github:   "bg-slate-100 text-slate-700 border-slate-300",
      facebook: "bg-indigo-50 text-indigo-700 border-indigo-200",
      manual:   "bg-purple-50 text-purple-700 border-purple-200"
    };
    return colors[provider] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getStatusColor = (status) => {
    return status === "activo" 
      ? "bg-green-100 text-green-800 border-green-200" 
      : "bg-gray-100 text-gray-600 border-gray-300";
  };

  const getRoleColor = (role) => {
    return role === "admin" 
      ? "bg-amber-100 text-amber-800 border-amber-200" 
      : "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Abrir modal para Crear
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ 
      username: "", 
      email: "", 
      telephone: "", 
      document: "", 
      role: "user", 
      status: "activo" 
    });
    setIsModalOpen(true);
  };

  // Abrir modal para Editar
  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      telephone: user.telephone || "",
      document: user.document || "",
      role: user.role || "user",
      status: user.status || "activo"
    });
    setIsModalOpen(true);
  };

  // Guardar (Crear o Editar)
  const handleSave = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      if (editingUser) {
        // Editar en Firestore
        const userRef = doc(db, "users", editingUser.id);
        await updateDoc(userRef, {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        // Crear en Firestore
        await addDoc(collection(db, "users"), {
          ...formData,
          uid: Date.now().toString(), // Dummy UID ya que no estamos usando Firebase Auth Admin
          createdAt: new Date(),
          updatedAt: new Date(),
          loginMethod: "manual",
          photoURL: ""
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      alert("Error al guardar el usuario");
    } finally {
      setLoadingAction(false);
    }
  };

  // Eliminar usuario
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await deleteDoc(doc(db, "users", id));
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar el usuario");
      }
    }
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
          <h2 className="text-3xl font-bold text-slate-700">Gestión de Usuarios</h2>
          <p className="text-slate-500 mt-1">Administra las cuentas y perfiles de los usuarios del sistema</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white transition px-4 py-2 rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo Usuario
          </button>
          <button 
            onClick={() => navigate('/Home')}
            className="bg-slate-200 hover:bg-slate-300 transition px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border border-gray-300"
          >
            Volver
          </button>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 border border-gray-300 rounded-xl mb-6 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Buscar Usuario
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, documento o teléfono..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white"
            />
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Filtrar por Rol
          </label>
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer text-slate-700 bg-white"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="user">Usuarios estándar</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Estado
          </label>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer text-slate-700 bg-white"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-500 rounded-xl overflow-hidden">
        {paginatedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-gray-500">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Método</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Creado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-100 transition border-b border-gray-500 last:border-0">
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <div className="flex items-center gap-3">
                        {u.photoURL ? (
                          <img 
                            src={u.photoURL} 
                            alt="" 
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full border border-gray-300 shadow-sm" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-200">
                            {u.username?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <span className="font-medium">{u.username || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {/* Priorizar el array de métodos, fallback al método único */}
                        {(u.loginMethods && u.loginMethods.length > 0 ? u.loginMethods : [u.loginMethod || "correo"]).map((method, idx) => (
                          <div key={idx} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getProviderColor(method)}`}>
                          {method === 'google' ? (
                              <FcGoogle className="w-3 h-3" />
                            ) : method === 'github' ? (
                              <FaGithub className="w-3 h-3" />
                            ) : method === 'facebook' ? (
                              <FaFacebook className="w-3 h-3 text-indigo-600" />
                            ) : (
                              <Mail className="w-3 h-3" />
                            )}
                            <span className="capitalize">{method}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {u.createdAt ? formatDate(u.createdAt) : (u.updatedAt ? formatDate(u.updatedAt) : "—")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getRoleColor(u.role)}`}>
                        {u.role === 'admin' ? (
                          <Shield size={14} className="text-amber-600" />
                        ) : (
                          <User size={14} className="text-slate-500" />
                        )}
                        <span className="capitalize">{u.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(u.status)}`}>
                        {u.status === 'activo' ? (
                          <UserCheck size={14} className="text-green-600" />
                        ) : (
                          <UserMinus size={14} className="text-gray-500" />
                        )}
                        <span className="capitalize">{u.status || "Activo"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
              <User className="w-8 h-8" />
            </div>
            <p className="text-slate-500 text-lg font-medium">No se encontraron usuarios registrados</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Mostrando <span className="font-semibold text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> – <span className="font-semibold text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> de <span className="font-semibold text-slate-700">{filteredUsers.length}</span> usuarios
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

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-300">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-700">
                {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"
                  placeholder="email@ejemplo.com"
                />
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Rol</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Documento</label>
                  <input 
                    type="text" 
                    value={formData.document}
                    onChange={(e) => setFormData({...formData, document: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                  <input 
                    type="text" 
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"
                    placeholder="3001234567"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer"
                >
                  {loadingAction ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
