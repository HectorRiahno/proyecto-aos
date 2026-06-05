import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Search, Hospital, Plus, X, Edit2, Trash2,
  User, AlertCircle, UserCheck, UserMinus, Droplets, Eye
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
  const [viewingPatient, setViewingPatient] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }

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
    
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    if (!formData.firstName.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    if (!nameRegex.test(formData.firstName.trim())) {
      setFormError("El nombre solo debe contener letras.");
      return;
    }

    if (!formData.lastName.trim()) {
      setFormError("El apellido es obligatorio.");
      return;
    }
    if (!nameRegex.test(formData.lastName.trim())) {
      setFormError("El apellido solo debe contener letras.");
      return;
    }

    if (!formData.document.trim()) {
      setFormError("El documento es obligatorio.");
      return;
    }
    if (!/^\d{5,12}$/.test(formData.document.trim())) {
      setFormError("El documento debe ser numérico y tener entre 5 y 12 dígitos.");
      return;
    }

    if (!formData.birthDate) {
      setFormError("La fecha de nacimiento es obligatoria.");
      return;
    }
    const birth = new Date(formData.birthDate);
    const today = new Date();
    if (birth > today) {
      setFormError("La fecha de nacimiento no puede estar en el futuro.");
      return;
    }

    if (!formData.gender) {
      setFormError("El género es obligatorio.");
      return;
    }

    if (!formData.bloodType) {
      setFormError("El tipo de sangre es obligatorio.");
      return;
    }

    if (formData.phone.trim() && !/^\+?[0-9\s\-]{7,15}$/.test(formData.phone.trim())) {
      setFormError("El teléfono debe ser un número válido (entre 7 y 15 dígitos).");
      return;
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setFormError("El correo electrónico no tiene un formato válido.");
      return;
    }

    if (formData.emergencyContact.trim() && !nameRegex.test(formData.emergencyContact.trim())) {
      setFormError("El nombre del contacto de emergencia solo debe contener letras.");
      return;
    }

    if (formData.emergencyPhone.trim() && !/^\+?[0-9\s\-]{7,15}$/.test(formData.emergencyPhone.trim())) {
      setFormError("El teléfono de emergencia debe ser un número válido (entre 7 y 15 dígitos).");
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
    try {
      await deleteDoc(doc(db, "patients", id));
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
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
                          onClick={() => setViewingPatient(patient)}
                          title="Ver detalles"
                          className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(patient)}
                          title="Editar"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ id: patient.id, name: `${patient.firstName} ${patient.lastName}` })}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-300">

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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Columna Izquierda: Datos Personales y Contacto */}
                <div className="space-y-6">
                  <fieldset className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                    <legend className="text-sm font-bold text-slate-600 uppercase tracking-wide px-2">
                      Datos Personales
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Nombre <span className="text-red-500">*</span></label>
                        <input name="firstName" value={formData.firstName} onChange={handleChange} required
                          placeholder="Juan" maxLength={50} pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$" title="Solo se permiten letras y espacios"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Apellido <span className="text-red-500">*</span></label>
                        <input name="lastName" value={formData.lastName} onChange={handleChange} required
                          placeholder="Pérez" maxLength={50} pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$" title="Solo se permiten letras y espacios"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          Documento <span className="text-red-500">*</span>
                        </label>
                        <input name="document" value={formData.document} onChange={handleChange} required
                          placeholder="1234567890" maxLength={12} pattern="\d{5,12}" title="El documento debe ser numérico y tener entre 5 y 12 dígitos" inputMode="numeric"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          Fecha de Nacimiento <span className="text-red-500">*</span>
                        </label>
                        <input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Género <span className="text-red-500">*</span></label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white cursor-pointer">
                          <option value="">Seleccionar...</option>
                          {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          Tipo de Sangre <span className="text-red-500">*</span>
                        </label>
                        <select name="bloodType" value={formData.bloodType} onChange={handleChange} required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white cursor-pointer">
                          <option value="">Seleccionar...</option>
                          {BLOOD_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                    <legend className="text-sm font-bold text-slate-600 uppercase tracking-wide px-2">
                      Contacto
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                        <input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                          placeholder="300 000 0000" pattern="\+?[0-9\s\-]{7,15}" title="El teléfono debe tener entre 7 y 15 dígitos"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange}
                          placeholder="paciente@correo.com" maxLength={100}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          Dirección
                        </label>
                        <input name="address" value={formData.address} onChange={handleChange}
                          placeholder="Calle 123 # 45-67, Bogotá"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                      </div>
                    </div>
                  </fieldset>
                </div>

                {/* Columna Derecha: Información Médica y Contacto de Emergencia */}
                <div className="space-y-6">
                  <fieldset className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                    <legend className="text-sm font-bold text-slate-600 uppercase tracking-wide px-2">
                      Información Médica
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
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
                          Alergias conocidas
                        </label>
                        <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows={2}
                          placeholder="Penicilina, látex, mariscos..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 resize-none" />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                    <legend className="text-sm font-bold text-slate-600 uppercase tracking-wide px-2">
                      Contacto de Emergencia
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Nombre</label>
                        <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange}
                          placeholder="María Pérez" maxLength={50} pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$" title="Solo se permiten letras y espacios"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                        <input name="emergencyPhone" type="tel" value={formData.emergencyPhone} onChange={handleChange}
                          placeholder="310 000 0000" pattern="\+?[0-9\s\-]{7,15}" title="El teléfono de emergencia debe tener entre 7 y 15 dígitos"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700" />
                      </div>
                    </div>
                  </fieldset>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={loadingAction}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer">
                  {loadingAction ? "Guardando..." : "Guardar"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {viewingPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-300">
            
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 uppercase flex items-center gap-2.5">
                {viewingPatient.firstName} {viewingPatient.lastName}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border normal-case ${getStatusColor(viewingPatient.status)}`}>
                  {viewingPatient.status === "activo" ? "Activo" : "Inactivo"}
                </span>
              </h3>
              <button onClick={() => setViewingPatient(null)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Columna Izquierda: Datos Personales y Contacto */}
                <div className="space-y-6">
                  
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide pb-2 border-b border-slate-200/60">
                      Datos Personales
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <span className="block text-xs font-semibold text-slate-400">Documento</span>
                        <span className="text-sm font-medium text-slate-700">{viewingPatient.document || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-400">Fecha de Nacimiento</span>
                        <span className="text-sm font-medium text-slate-700">
                          {formatDate(viewingPatient.birthDate)} ({calcAge(viewingPatient.birthDate)})
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-400">Género</span>
                        <span className="text-sm font-medium text-slate-700">{viewingPatient.gender || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-400">Tipo de Sangre</span>
                        <div className="mt-0.5">
                          {viewingPatient.bloodType ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBloodColor(viewingPatient.bloodType)}`}>
                              {viewingPatient.bloodType}
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-slate-700">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide pb-2 border-b border-slate-200/60">
                      Contacto
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <span className="block text-xs font-semibold text-slate-400">Teléfono</span>
                        <span className="text-sm font-medium text-slate-700">{viewingPatient.phone || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-400">Correo Electrónico</span>
                        <span className="text-sm font-medium text-slate-700">{viewingPatient.email || "—"}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="block text-xs font-semibold text-slate-400">Dirección</span>
                        <span className="text-sm font-medium text-slate-700">{viewingPatient.address || "—"}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Columna Derecha: Información Médica y Contacto de Emergencia */}
                <div className="space-y-6">
                  
                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide pb-2 border-b border-slate-200/60">
                      Información Médica
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <span className="block text-xs font-semibold text-slate-400">EPS / Aseguradora</span>
                        <span className="text-sm font-medium text-slate-700">{viewingPatient.eps || "—"}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="block text-xs font-semibold text-slate-400">Alergias conocidas</span>
                        <p className="text-sm font-medium text-slate-700 bg-white border border-slate-200/60 rounded-lg p-2.5 mt-1 min-h-[60px] whitespace-pre-line">
                          {viewingPatient.allergies || "Ninguna registrada."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide pb-2 border-b border-slate-200/60">
                      Contacto de Emergencia
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <span className="block text-xs font-semibold text-slate-400">Nombre de Contacto</span>
                        <span className="text-sm font-medium text-slate-700">{viewingPatient.emergencyContact || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-400">Teléfono de Contacto</span>
                        <span className="text-sm font-medium text-slate-700">{viewingPatient.emergencyPhone || "—"}</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewingPatient(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-300 overflow-hidden">

            {/* Header rojo */}
            <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 border border-red-200">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-700">Eliminar paciente</h3>
                <p className="text-sm text-red-500 mt-0.5">Esta acción no se puede deshacer</p>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="px-6 py-5">
              <p className="text-sm text-slate-600">
                ¿Estás seguro de que deseas eliminar a{" "}
                <span className="font-bold text-slate-800">{confirmDelete.name}</span>?
                {" "}Se perderá toda su información registrada en el sistema.
              </p>
            </div>

            {/* Acciones */}
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-5 py-2 border border-gray-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete.id)}
                className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition cursor-pointer flex items-center gap-2"
              >
                <Trash2 size={14} />
                Sí, eliminar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default PatientsPage;
