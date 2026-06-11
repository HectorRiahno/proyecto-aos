import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../firebase";
import { createDoctor, updateDoctor, deleteDoctor } from "../services/doctorService";
import {
  Search, Plus, X, Edit2, Trash2, User, AlertCircle,
  CheckCircle, Stethoscope, Phone, Mail, MapPin, Activity
} from "lucide-react";

const ESPECIALIDADES = [
  "Cardiología", "Dermatología", "Endocrinología", "Gastroenterología",
  "Ginecología", "Medicina General", "Medicina Interna", "Nefrología",
  "Neurología", "Oftalmología", "Oncología", "Ortopedia", "Otorrinolaringología",
  "Pediatría", "Psiquiatría", "Radiología", "Reumatología", "Traumatología", "Urología",
];

const EMPTY_FORM = {
  nombre: "", apellido: "", especialidad: "", telefono: "",
  correo: "", direccion: "", estado: true,
};

const ITEMS_PER_PAGE = 8;

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = type === "success"
    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
    : "bg-red-50 border-red-300 text-red-800";

  return (
    <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-lg text-sm font-medium animate-in slide-in-from-right ${styles}`}>
      {type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 cursor-pointer"><X size={14} /></button>
    </div>
  );
}

export default function DoctorsPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [filterEsp, setFilterEsp] = useState("todas");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);


  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "doctores"),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`));
        setDoctors(data);
      },
      (err) => {
        console.error("Error al escuchar doctores:", err);
        showToast("Error al cargar doctores desde Firestore.", "error");
      }
    );
    return () => unsub();
  }, []);

  const showToast = (message, type = "success") => setToast({ message, type });

  const filtered = doctors.filter((d) => {
    const term = search.toLowerCase();
    const matchSearch =
      `${d.nombre} ${d.apellido}`.toLowerCase().includes(term) ||
      (d.especialidad?.toLowerCase() || "").includes(term) ||
      (d.correo?.toLowerCase() || "").includes(term);
    const matchEsp = filterEsp === "todas" || d.especialidad === filterEsp;
    const matchEstado =
      filterEstado === "todos" ||
      (filterEstado === "activo" && d.estado === true) ||
      (filterEstado === "inactivo" && d.estado === false);
    return matchSearch && matchEsp && matchEstado;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const openCreate = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEdit = (doc) => {
    setEditing(doc);
    setFormData({
      nombre: doc.nombre || "",
      apellido: doc.apellido || "",
      especialidad: doc.especialidad || "",
      telefono: doc.telefono || "",
      correo: doc.correo || "",
      direccion: doc.direccion || "",
      estado: doc.estado ?? true,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const nameRx = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!formData.nombre.trim()) return "El nombre es obligatorio.";
    if (!nameRx.test(formData.nombre.trim())) return "El nombre solo debe contener letras.";
    if (!formData.apellido.trim()) return "El apellido es obligatorio.";
    if (!nameRx.test(formData.apellido.trim())) return "El apellido solo debe contener letras.";
    if (!formData.especialidad) return "La especialidad es obligatoria.";
    if (formData.telefono.trim() && !/^\+?[0-9\s\-]{7,15}$/.test(formData.telefono.trim()))
      return "El teléfono debe tener entre 7 y 15 dígitos.";
    if (formData.correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo.trim()))
      return "El correo no tiene un formato válido.";
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError("");
    setLoading(true);
    try {
      if (editing) {
        await updateDoctor(editing.id, formData);
        showToast("Doctor actualizado correctamente.");
      } else {
        await createDoctor(formData);
        showToast("Doctor creado correctamente.");
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setFormError("Error al guardar. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteDoctor(confirmDelete.id);
      showToast("Doctor eliminado correctamente.");
    } catch (err) {
      console.error(err);
      showToast("Error al eliminar el doctor.", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Stethoscope size={18} />
            </div>
            <h1 className="text-xl font-bold text-blue-600">HospitalIS PRO</h1>
          </div>
          <h2 className="text-3xl font-bold text-slate-700">Gestión de Doctores</h2>
          <p className="text-slate-500 mt-1">Registra y administra el equipo médico</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
          >
            <Plus size={16} /> Nuevo Doctor
          </button>
          <button
            onClick={() => navigate("/Home")}
            className="bg-slate-200 hover:bg-slate-300 transition px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border border-gray-300"
          >
            Volver al Home
          </button>
        </div>
      </div>

      <div className="bg-white p-4 border border-gray-300 rounded-xl mb-6 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-600 mb-2">Buscar Doctor</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Nombre, apellido, especialidad..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Especialidad</label>
          <select
            value={filterEsp}
            onChange={(e) => { setFilterEsp(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700 bg-white cursor-pointer"
          >
            <option value="todas">Todas</option>
            {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Estado</label>
          <select
            value={filterEstado}
            onChange={(e) => { setFilterEstado(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700 bg-white cursor-pointer"
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

  
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden">
        {paginated.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-gray-300">
                  {["Doctor", "Especialidad", "Teléfono", "Correo", "Dirección", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition border-b border-gray-200 last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 border border-blue-200 flex-shrink-0">
                          {doc.nombre?.charAt(0).toUpperCase()}{doc.apellido?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-700 text-sm">Dr. {doc.nombre} {doc.apellido}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Activity size={11} />{doc.especialidad || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5"><Phone size={13} className="text-slate-400" />{doc.telefono || "—"}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5"><Mail size={13} className="text-slate-400" />{doc.correo || "—"}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" />{doc.direccion || "—"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${doc.estado ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-300"}`}>
                        {doc.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(doc)}
                          title="Editar"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ id: doc.id, nombre: `${doc.nombre} ${doc.apellido}` })}
                          title="Eliminar"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
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
            <p className="text-slate-500 text-lg font-medium">No se encontraron doctores</p>
            <p className="text-slate-400 text-sm mt-1">
              {search || filterEsp !== "todas" || filterEstado !== "todos"
                ? "Intenta con otros filtros."
                : 'Crea el primer doctor con el botón "Nuevo Doctor".'}
            </p>
          </div>
        )}
      </div>


      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Mostrando <span className="font-semibold text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
            {" – "}
            <span className="font-semibold text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span>
            {" de "}
            <span className="font-semibold text-slate-700">{filtered.length}</span> doctores
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition"
            >← Anterior</button>
            <span className="text-sm text-slate-600 px-2 self-center">
              Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition"
            >Siguiente →</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-300">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                <Stethoscope size={20} className="text-blue-600" />
                {editing ? "Editar Doctor" : "Nuevo Doctor"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition cursor-pointer"><X size={24} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle size={16} />{formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Nombre <span className="text-red-500">*</span></label>
                  <input name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej: Carlos"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Apellido <span className="text-red-500">*</span></label>
                  <input name="apellido" value={formData.apellido} onChange={handleChange} required placeholder="Ej: Gómez"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Especialidad <span className="text-red-500">*</span></label>
                  <select name="especialidad" value={formData.especialidad} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700 bg-white cursor-pointer">
                    <option value="">Seleccionar especialidad...</option>
                    {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                  <input name="telefono" type="tel" value={formData.telefono} onChange={handleChange} placeholder="300 000 0000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Correo</label>
                  <input name="correo" type="email" value={formData.correo} onChange={handleChange} placeholder="doctor@hospital.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Dirección</label>
                  <input name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Calle 45 # 12-34, Bogotá"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="estado" checked={formData.estado} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                  <span className="text-sm font-medium text-slate-600">
                    Doctor {formData.estado ? <span className="text-green-600 font-bold">Activo</span> : <span className="text-gray-500 font-bold">Inactivo</span>}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer">
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-300 overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-700">Eliminar doctor</h3>
                <p className="text-sm text-red-500 mt-0.5">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-600">
                ¿Estás seguro de que deseas eliminar a{" "}
                <span className="font-bold text-slate-800">Dr. {confirmDelete.nombre}</span>?
                Se perderá toda su información.
              </p>
            </div>
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="px-5 py-2 border border-gray-300 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition cursor-pointer">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
