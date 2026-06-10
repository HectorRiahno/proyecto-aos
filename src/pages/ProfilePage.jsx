import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Hospital,
  User,
  Mail,
  Phone,
  IdCard,
  Shield,
  Pencil,
  Save,
  X,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaFacebook } from "react-icons/fa";

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: "", telephone: "" });
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setProfileData(data);
          setForm({ username: data.username || "", telephone: data.telephone || "" });
        }
      } catch (err) {
        console.error("Error obteniendo perfil:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, {
        username: form.username,
        telephone: form.telephone,
        updatedAt: new Date(),
      });
      setProfileData((prev) => ({ ...prev, ...form }));
      setEditing(false);
      setSuccessMsg("Perfil actualizado correctamente.");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      console.error("Error guardando perfil:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({ username: profileData?.username || "", telephone: profileData?.telephone || "" });
  };

  const formatDate = (date) => {
    if (!date) return "—";
    const d = date?.toDate?.() || date;
    return new Date(d).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getProviderColor = (provider) => {
    const colors = {
      correo:   "bg-blue-50 text-blue-700 border-blue-200",
      google:   "bg-red-50 text-red-700 border-red-200",
      github:   "bg-slate-100 text-slate-700 border-slate-300",
      facebook: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
    return colors[provider] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getProviderIcon = (provider) => {
    if (provider === "google")   return <FcGoogle size={13} />;
    if (provider === "github")   return <FaGithub size={13} />;
    if (provider === "facebook") return <FaFacebook size={13} className="text-blue-600" />;
    return null;
  };

  const getProviderLabel = (provider) => {
    const labels = {
      correo: "Correo",
      google: "Google",
      github: "GitHub",
      facebook: "Facebook",
    };
    return labels[provider] || provider;
  };

  const getStatusColor = (status) =>
    status === "activo"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-600 border-gray-300";

  const getRoleColor = (role) =>
    role === "admin"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  const initial = (profileData?.username || user?.email || "U").charAt(0).toUpperCase();

  if (loading || fetching) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Cargando perfil...</p>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold text-slate-700">Mi Perfil</h2>
          <p className="text-slate-500 mt-1">Consulta y edita tu información personal</p>
        </div>

        <button
          onClick={() => navigate('/Home')}
          className="bg-slate-200 hover:bg-slate-300 transition px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border border-gray-300"
        >
          Volver al Home
        </button>
      </div>

      {/* Toast de éxito */}
      {successMsg && (
        <div className="mb-5 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna izquierda – Avatar y datos básicos */}
        <div className="bg-white border border-gray-300 rounded-xl p-6 flex flex-col items-center text-center gap-3">
          {profileData?.photoURL ? (
            <img
              src={profileData.photoURL}
              alt="avatar"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl font-bold">
              {initial}
            </div>
          )}

          <div>
            <p className="text-lg font-semibold text-slate-700">
              {profileData?.username || "Sin nombre"}
            </p>
            <p className="text-slate-500 text-sm">{profileData?.email || user?.email}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getRoleColor(profileData?.role)}`}>
              {profileData?.role === "admin" ? "Administrador" : "Usuario"}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusColor(profileData?.status)}`}>
              {profileData?.status || "—"}
            </span>
          </div>

          {/* Métodos de acceso */}
          <div className="w-full border-t border-gray-200 pt-3 mt-1">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Métodos de acceso</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(profileData?.loginMethods || [profileData?.loginMethod]).filter(Boolean).map((m) => (
                <span
                  key={m}
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${getProviderColor(m)}`}
                >
                  {getProviderIcon(m)}
                  {getProviderLabel(m)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha – Información editable */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Datos personales */}
          <div className="bg-white border border-gray-300 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-700">Datos personales</h3>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 transition px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 cursor-pointer border border-gray-300"
                >
                  <Pencil size={14} />
                  Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 transition px-3 py-1.5 rounded-lg text-sm font-medium text-white cursor-pointer disabled:opacity-60"
                  >
                    <Save size={14} />
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 transition px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 cursor-pointer border border-gray-300"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Nombre de usuario */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <User size={13} className="text-slate-400" />
                  Nombre de usuario
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white text-sm"
                  />
                ) : (
                  <p className="text-slate-700 text-sm py-2 px-3 bg-slate-50 border border-gray-200 rounded-lg">
                    {profileData?.username || "—"}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Mail size={13} className="text-slate-400" />
                  Correo electrónico
                </label>
                <p className="text-slate-700 text-sm py-2 px-3 bg-slate-50 border border-gray-200 rounded-lg">
                  {profileData?.email || user?.email || "—"}
                </p>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Phone size={13} className="text-slate-400" />
                  Teléfono
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={form.telephone}
                    onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white text-sm"
                  />
                ) : (
                  <p className="text-slate-700 text-sm py-2 px-3 bg-slate-50 border border-gray-200 rounded-lg">
                    {profileData?.telephone || "—"}
                  </p>
                )}
              </div>

              {/* Documento */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <IdCard size={13} className="text-slate-400" />
                  Documento
                </label>
                <p className="text-slate-700 text-sm py-2 px-3 bg-slate-50 border border-gray-200 rounded-lg">
                  {profileData?.document || "—"}
                </p>
              </div>

            </div>
          </div>

          {/* Información de cuenta */}
          <div className="bg-white border border-gray-300 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Información de cuenta</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Shield size={13} className="text-slate-400" />
                  Rol
                </label>
                <p className="text-slate-700 text-sm py-2 px-3 bg-slate-50 border border-gray-200 rounded-lg">
                  {profileData?.role === "admin" ? "Administrador" : "Usuario"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
                <p className="text-slate-700 text-sm py-2 px-3 bg-slate-50 border border-gray-200 rounded-lg">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusColor(profileData?.status)}`}>
                    {profileData?.status || "—"}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  Fecha de registro
                </label>
                <p className="text-slate-700 text-sm py-2 px-3 bg-slate-50 border border-gray-200 rounded-lg">
                  {formatDate(profileData?.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  Última actualización
                </label>
                <p className="text-slate-700 text-sm py-2 px-3 bg-slate-50 border border-gray-200 rounded-lg">
                  {formatDate(profileData?.updatedAt)}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
