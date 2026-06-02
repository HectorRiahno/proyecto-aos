import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Search, Hospital, Plus, X, Edit2, Trash2,
  User, Phone, CreditCard, Calendar, MapPin,
  Droplets, HeartPulse, AlertCircle, UserCheck, UserMinus
} from "lucide-react";

const BLOOD_TYPES = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
const GENDER_OPTIONS = ["Masculino", "Femenino", "Otro"];
const STATUS_OPTIONS = ["activo", "inactivo"];
const ITEMS_PER_PAGE = 10;

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  document: "",
  birthDate: "",
  gender: "",
  bloodType: "",
  phone: "",
  email: "",
  address: "",
  eps: "",
  emergencyContact: "",
  emergencyPhone: "",
  allergies: "",
  status: "activo",
};

function PatientsPage() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterGender, setFilterGender] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loadingAction, setLoadingAction] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "patients"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const na = `${a.lastName} ${a.firstName}`.toLowerCase();
          const nb = `${b.lastName} ${b.firstName}`.toLowerCase();
          return na.localeCompare(nb);
        });
        setPatients(data);
      },
      (error) => console.error("Error al obtener pacientes:", error)
    );
    return () => unsub();
  }, []);

  const filteredPatients = patients.filter((p) => {
    const term = search.toLowerCase();
    const matchSearch =
      (`${p.firstName} ${p.lastName}`.toLowerCase()).includes(term) ||
      (p.document?.toLowerCase() || "").includes(term) ||
      (p.email?.toLowerCase() || "").includes(term) ||
      (p.eps?.toLowerCase() || "").includes(term) ||
      (p.phone?.toLowerCase() || "").includes(term);

    const matchStatus = filterStatus === "todos" || p.status === filterStatus;
    const matchGender = filterGender === "todos" || p.gender === filterGender;

    return matchSearch && matchStatus && matchGender;
  });

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginated = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (v) => { setSearch(v); setCurrentPage(1); };
  const handleStatusChange = (v) => { setFilterStatus(v); setCurrentPage(1); };
  const handleGenderChange = (v) => { setFilterGender(v); setCurrentPage(1); };

  const getStatusColor = (s) =>
    s === "activo"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-600 border-gray-300";

  const getBloodColor = (bt) => {
    if (!bt) return "bg-gray-100 text-gray-600 border-gray-300";
    return bt.includes("O")
      ? "bg-red-100 text-red-700 border-red-200"
      : bt.includes("AB")
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : bt.includes("A")
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-orange-100 text-orange-700 border-orange-200";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES");
  };

  const calcAge = (dateStr) => {
    if (!dateStr) return "—";
    const birth = new Date(dateStr + "T00:00:00");
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} años`;
  };

  const openCreateModal = () => {
    setEditingPatient(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setFormData({
      firstName: patient.firstName || "",
      lastName: patient.lastName || "",
      document: patient.document || "",
      birthDate: patient.birthDate || "",
      gender: patient.gender || "",
      bloodType: patient.bloodType || "",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      eps: patient.eps || "",
      emergencyContact: patient.emergencyContact || "",
      emergencyPhone: patient.emergencyPhone || "",
      allergies: patient.allergies || "",
      status: patient.status || "activo",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
    setFormError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.document.trim()) {
      setFormError("Nombre, apellido y documento son obligatorios.");
      return;
    }
    setFormError("");
    setLoadingAction(true);
    try {
      if (editingPatient) {
        await updateDoc(doc(db, "patients", editingPatient.id), {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, "patients"), {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setFormError("Error al guardar el paciente. Intenta de nuevo.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este paciente?")) return;
    try {
      await deleteDoc(doc(db, "patients", id));
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el paciente.");
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Hospital size={18} />
            </div>
            <h1 className="text-xl font-bold text-blue-600">HospitalIS PRO</h1>
          </div>
          <h2 className="text-3xl font-bold text-slate-700">Gestión de Pacientes</h2>
          <p className="text-slate-500 mt-1">Registra y administra la información de los pacientes</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
          >
            <Plus size={16} /> Nuevo Paciente
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
          <label className="block text-sm font-medium text-slate-600 mb-2">Buscar Paciente</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Nombre, documento, email, EPS..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Estado</label>
          <select
            value={filterStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer text-slate-700 bg-white"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Género</label>
          <select
            value={filterGender}
            onChange={(e) => handleGenderChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer text-slate-700 bg-white"
          >
            <option value="todos">Todos los géneros</option>
            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-500 rounded-xl overflow-hidden">
        {paginated.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-gray-500">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Paciente</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Documento</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Edad</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Género</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Sangre</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Teléfono</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">EPS</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Estado</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-100 transition border-b border-gray-500 last:border-0">
                    <td className="px-6 py-4 text-sm text-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-200">
                          {patient.firstName?.charAt(0).toUpperCase()}{patient.lastName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{patient.document || "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{calcAge(patient.birthDate)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{patient.gender || "—"}</td>
                    <td className="px-6 py-4 text-sm">
                      {patient.bloodType ? (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getBloodColor(patient.bloodType)}`}>
                          <Droplets size={11} /> {patient.bloodType}
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{patient.phone || "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{patient.eps || "—"}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(patient.status)}`}>
                        {patient.status === "activo" ? (
                          <UserCheck size={14} className="text-green-600" />
                        ) : (
                          <UserMinus size={14} className="text-gray-500" />
                        )}
                        <span className="capitalize">{patient.status || "activo"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(patient)}
                          title="Editar"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
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
            <p className="text-slate-500 text-lg font-medium">No se encontraron pacientes</p>
            <p className="text-slate-400 text-sm mt-1">
              {search || filterStatus !== "todos" || filterGender !== "todos"
                ? "Intenta con otros filtros."
                : "Crea el primer paciente con el botón \"Nuevo Paciente\"."}
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Mostrando{" "}
            <span className="font-semibold text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
            {" – "}
            <span className="font-semibold text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)}</span>
            {" de "}
            <span className="font-semibold text-slate-700">{filteredPatients.length}</span> pacientes
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-300">

            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-700">
                {editingPatient ? "Editar Paciente" : "Nuevo Paciente"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">

              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle size={16} /> {formError}
                </div>
              )}

              <fieldset>
                <legend className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <User size={14} /> Datos Personales
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nombre <span className="text-red-500">*</span></label>
                    <input name="firstName" value={formData.firstName} onChange={handleChange} required
                      placeholder="Juan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Apellido <span className="text-red-500">*</span></label>
                    <input name="lastName" value={formData.lastName} onChange={handleChange} required
                      placeholder="Pérez"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      <CreditCard size={13} className="inline mr-1" />Documento <span className="text-red-500">*</span>
                    </label>
                    <input name="document" value={formData.document} onChange={handleChange} required
                      placeholder="1234567890"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      <Calendar size={13} className="inline mr-1" />Fecha de Nacimiento
                    </label>
                    <input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Género</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white cursor-pointer">
                      <option value="">Seleccionar...</option>
                      {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      <Droplets size={13} className="inline mr-1" />Tipo de Sangre
                    </label>
                    <select name="bloodType" value={formData.bloodType} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white cursor-pointer">
                      <option value="">Seleccionar...</option>
                      {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Phone size={14} /> Contacto
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                    <input name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="300 000 0000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange}
                      placeholder="paciente@correo.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      <MapPin size={13} className="inline mr-1" />Dirección
                    </label>
                    <input name="address" value={formData.address} onChange={handleChange}
                      placeholder="Calle 123 # 45-67, Bogotá"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <HeartPulse size={14} /> Información Médica
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">EPS / Aseguradora</label>
                    <input name="eps" value={formData.eps} onChange={handleChange}
                      placeholder="Nueva EPS, Sanitas..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Estado</label>
                    <select name="status" value={formData.status} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white cursor-pointer">
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      <AlertCircle size={13} className="inline mr-1" />Alergias conocidas
                    </label>
                    <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows={2}
                      placeholder="Penicilina, látex, mariscos..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 resize-none" />
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Phone size={14} /> Contacto de Emergencia
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
                    <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange}
                      placeholder="María Pérez"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                    <input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange}
                      placeholder="310 000 0000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                  </div>
                </div>
              </fieldset>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={loadingAction}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer">
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

export default PatientsPage;
