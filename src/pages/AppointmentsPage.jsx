import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "../firebase";
import {
  createAppointment,
  updateAppointment,
  deleteAppointment
} from "../services/appointmentService";
import {
  Search, Plus, X, Edit2, Trash2, Calendar, Clock,
  User, Stethoscope, FileText, AlertCircle, CheckCircle,
  Hospital, Activity, Eye
} from "lucide-react";

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

const EMPTY_FORM = {
  pacienteId: "",
  medicoId: "",
  fecha: "",
  hora: "",
  motivo: "",
  estado: "programada",
};

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterDoctor, setFilterDoctor] = useState("todos");
  const [filterPatient, setFilterPatient] = useState("todos");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);

  // Load live data
  useEffect(() => {
    // 1. Listen to appointments
    const unsubAppts = onSnapshot(
      collection(db, "citas"),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by date and time (descending)
        data.sort((a, b) => {
          const dateTimeA = `${a.fecha}T${a.hora || "00:00"}`;
          const dateTimeB = `${b.fecha}T${b.hora || "00:00"}`;
          return dateTimeB.localeCompare(dateTimeA);
        });
        setAppointments(data);
      },
      (err) => {
        console.error("Error al escuchar citas:", err);
        showToast("Error al cargar citas desde Firestore.", "error");
      }
    );

    // 2. Listen to doctors
    const unsubDocs = onSnapshot(
      collection(db, "doctores"),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`));
        setDoctors(data);
      },
      (err) => console.error("Error al escuchar doctores:", err)
    );

    // 3. Listen to patients
    const unsubPatients = onSnapshot(
      collection(db, "patients"),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`));
        setPatients(data);
      },
      (err) => console.error("Error al escuchar pacientes:", err)
    );

    return () => {
      unsubAppts();
      unsubDocs();
      unsubPatients();
    };
  }, []);

  const showToast = (message, type = "success") => setToast({ message, type });

  // Map helper lookups
  const doctorMap = doctors.reduce((acc, doc) => {
    acc[doc.id] = doc;
    return acc;
  }, {});

  const patientMap = patients.reduce((acc, pat) => {
    acc[pat.id] = pat;
    return acc;
  }, {});

  // Filters logic
  const filtered = appointments.filter((appt) => {
    const term = search.toLowerCase();

    // Resolve doctor and patient names
    const doctorObj = doctorMap[appt.medicoId];
    const patientObj = patientMap[appt.pacienteId];

    const doctorName = doctorObj ? `${doctorObj.nombre} ${doctorObj.apellido}`.toLowerCase() : "";
    const patientName = patientObj ? `${patientObj.firstName} ${patientObj.lastName}`.toLowerCase() : "";
    const patientDoc = patientObj ? (patientObj.document || "").toLowerCase() : "";
    const reasonText = (appt.motivo || "").toLowerCase();

    const matchSearch =
      doctorName.includes(term) ||
      patientName.includes(term) ||
      patientDoc.includes(term) ||
      reasonText.includes(term);

    const matchStatus = filterStatus === "todos" || appt.estado === filterStatus;
    const matchDoctor = filterDoctor === "todos" || appt.medicoId === filterDoctor;
    const matchPatient = filterPatient === "todos" || appt.pacienteId === filterPatient;

    return matchSearch && matchStatus && matchDoctor && matchPatient;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Active items for dropdown (used in create/edit)
  const activeDoctors = doctors.filter(d => d.estado !== false);
  const activePatients = patients.filter(p => p.status === "activo");

  const openCreate = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEdit = (appt) => {
    setEditing(appt);
    setFormData({
      pacienteId: appt.pacienteId || "",
      medicoId: appt.medicoId || "",
      fecha: appt.fecha || "",
      hora: appt.hora || "",
      motivo: appt.motivo || "",
      estado: appt.estado || "programada",
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.pacienteId) return "Debe seleccionar un paciente.";
    if (!formData.medicoId) return "Debe seleccionar un médico.";
    if (!formData.fecha) return "Debe ingresar la fecha de la cita.";
    if (!formData.hora) return "Debe ingresar la hora de la cita.";
    if (!formData.motivo.trim()) return "El motivo de la cita es obligatorio.";
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
        await updateAppointment(editing.id, formData);
        showToast("Cita actualizada correctamente.");
      } else {
        await createAppointment(formData);
        showToast("Cita programada correctamente.");
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setFormError("Error al guardar la cita. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteAppointment(confirmDelete.id);
      showToast("Cita eliminada correctamente.");
    } catch (err) {
      console.error(err);
      showToast("Error al eliminar la cita.", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "programada":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "completada":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelada":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Hospital size={18} />
            </div>
            <h1 className="text-xl font-bold text-blue-600">HospitalIS PRO</h1>
          </div>
          <h2 className="text-3xl font-bold text-slate-700">Gestión de Citas</h2>
          <p className="text-slate-500 mt-1">Agenda, edita y controla la programación médica</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
          >
            <Plus size={16} /> Nueva Cita
          </button>
          <button
            onClick={() => navigate("/Home")}
            className="bg-slate-200 hover:bg-slate-300 transition px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border border-gray-300"
          >
            Volver al Home
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border border-gray-300 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-600 mb-2">Buscar Cita</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Paciente, médico o motivo..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Estado</label>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700 bg-white cursor-pointer text-sm"
          >
            <option value="todos">Todos los estados</option>
            <option value="programada">Programadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Médico</label>
          <select
            value={filterDoctor}
            onChange={(e) => { setFilterDoctor(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700 bg-white cursor-pointer text-sm"
          >
            <option value="todos">Todos los médicos</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.nombre} {d.apellido} ({d.especialidad})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Paciente</label>
          <select
            value={filterPatient}
            onChange={(e) => { setFilterPatient(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700 bg-white cursor-pointer text-sm"
          >
            <option value="todos">Todos los pacientes</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} — {p.document}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main List Table */}
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden">
        {paginated.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-gray-300">
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase">Paciente</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase">Médico Asignado</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase">Fecha y Hora</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase">Motivo</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((appt) => {
                  const doctorObj = doctorMap[appt.medicoId];
                  const patientObj = patientMap[appt.pacienteId];

                  return (
                    <tr key={appt.id} className="hover:bg-slate-50 transition border-b border-gray-200 last:border-0">
                      {/* Patient */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                            {patientObj ? (
                              `${patientObj.firstName?.charAt(0).toUpperCase()}${patientObj.lastName?.charAt(0).toUpperCase()}`
                            ) : (
                              <User size={14} />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700 text-sm">
                              {patientObj ? `${patientObj.firstName} ${patientObj.lastName}` : "Paciente no encontrado"}
                            </span>
                            <span className="text-slate-400 text-xs font-medium">
                              CC: {patientObj?.document || "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 flex-shrink-0">
                            <Stethoscope size={16} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700 text-sm">
                              {doctorObj ? `Dr. ${doctorObj.nombre} ${doctorObj.apellido}` : "Médico no encontrado"}
                            </span>
                            <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 max-w-max">
                              {doctorObj?.especialidad || "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date and Time */}
                      <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Calendar size={13} className="text-slate-400" />
                            {formatDate(appt.fecha)}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <Clock size={13} className="text-slate-400" />
                            {appt.hora || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-5 py-4 text-sm text-slate-600 max-w-xs truncate" title={appt.motivo}>
                        <div className="flex items-start gap-1.5">
                          <FileText size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600 leading-normal">{appt.motivo}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${getStatusStyle(appt.estado)}`}>
                          {appt.estado === "completada" ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          ) : appt.estado === "cancelada" ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          )}
                          {appt.estado}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingDetails(appt)}
                            title="Ver Detalles"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEdit(appt)}
                            title="Editar Cita"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const patName = patientObj ? `${patientObj.firstName} ${patientObj.lastName}` : "Paciente";
                              const docName = doctorObj ? `${doctorObj.nombre} ${doctorObj.apellido}` : "Médico";
                              setConfirmDelete({
                                id: appt.id,
                                detail: `de ${patName} con el Dr. ${docName} el ${formatDate(appt.fecha)}`
                              });
                            }}
                            title="Eliminar Cita"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <p className="text-slate-500 text-lg font-medium">No se encontraron citas</p>
            <p className="text-slate-400 text-sm mt-1">
              {search || filterStatus !== "todos" || filterDoctor !== "todos" || filterPatient !== "todos"
                ? "Intenta con otros filtros."
                : 'Programa la primera cita médica con el botón "Nueva Cita".'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Mostrando <span className="font-semibold text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
            {" – "}
            <span className="font-semibold text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</span>
            {" de "}
            <span className="font-semibold text-slate-700">{filtered.length}</span> citas
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

      {/* View Details Modal */}
      {viewingDetails && (() => {
        const docObj = doctorMap[viewingDetails.medicoId];
        const patObj = patientMap[viewingDetails.pacienteId];

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-300 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <Activity size={20} className="text-blue-600" />
                  Detalles Completos de la Cita
                </h3>
                <button onClick={() => setViewingDetails(null)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer"><X size={22} /></button>
              </div>

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Datos Cita Principal */}
                <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 border border-blue-100 rounded-xl">
                  <div>
                    <span className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider">Fecha de la Cita</span>
                    <span className="text-slate-700 font-semibold text-sm flex items-center gap-1.5 mt-1">
                      <Calendar size={14} className="text-blue-500" />
                      {formatDate(viewingDetails.fecha)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider">Hora Programada</span>
                    <span className="text-slate-700 font-semibold text-sm flex items-center gap-1.5 mt-1">
                      <Clock size={14} className="text-blue-500" />
                      {viewingDetails.hora || "—"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider">Estado de la Cita</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border capitalize mt-1.5 ${getStatusStyle(viewingDetails.estado)}`}>
                      {viewingDetails.estado}
                    </span>
                  </div>
                </div>

                {/* Paciente */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Información del Paciente</h4>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 mt-1 flex-shrink-0">
                      {patObj ? `${patObj.firstName?.charAt(0).toUpperCase()}${patObj.lastName?.charAt(0).toUpperCase()}` : <User size={16} />}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
                      <div className="col-span-2">
                        <span className="text-xs text-slate-400 font-medium">Nombre Completo</span>
                        <p className="text-sm text-slate-800 font-semibold">{patObj ? `${patObj.firstName} ${patObj.lastName}` : "Paciente no encontrado"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-medium">Documento (CC)</span>
                        <p className="text-sm text-slate-700 font-medium">{patObj?.document || "—"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-medium">Teléfono / Celular</span>
                        <p className="text-sm text-slate-700 font-medium">{patObj?.phone || "—"}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs text-slate-400 font-medium">Correo Electrónico</span>
                        <p className="text-sm text-slate-700 font-medium">{patObj?.email || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Médico */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Médico Asignado</h4>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 mt-1 flex-shrink-0">
                      <Stethoscope size={18} />
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
                      <div className="col-span-2">
                        <span className="text-xs text-slate-400 font-medium">Nombre del Médico</span>
                        <p className="text-sm text-slate-800 font-semibold">{docObj ? `Dr. ${docObj.nombre} ${docObj.apellido}` : "Médico no encontrado"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-medium">Especialidad</span>
                        <p className="text-sm text-slate-700 font-medium">{docObj?.especialidad || "—"}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-medium">Teléfono</span>
                        <p className="text-sm text-slate-700 font-medium">{docObj?.telefono || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Motivo de la Consulta */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Motivo de la Cita / Observaciones</h4>
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{viewingDetails.motivo || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setViewingDetails(null)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition cursor-pointer text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-300">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                {editing ? "Editar Cita Médica" : "Programar Nueva Cita"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition cursor-pointer"><X size={24} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  <AlertCircle size={16} />{formError}
                </div>
              )}

              <div className="space-y-4">
                {/* Paciente */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Paciente <span className="text-red-500">*</span></label>
                  <select
                    name="pacienteId"
                    value={formData.pacienteId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white cursor-pointer text-sm"
                  >
                    <option value="">Seleccionar paciente...</option>
                    {activePatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} — CC: {p.document}
                      </option>
                    ))}
                    {/* Add editing lookup fallback if selected patient is inactive */}
                    {editing && formData.pacienteId && !activePatients.some(p => p.id === formData.pacienteId) && (
                      <option value={formData.pacienteId}>
                        {patientMap[formData.pacienteId]
                          ? `${patientMap[formData.pacienteId].firstName} ${patientMap[formData.pacienteId].lastName} (Inactivo)`
                          : "Paciente seleccionado (Inactivo)"}
                      </option>
                    )}
                  </select>
                </div>

                {/* Médico */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Médico <span className="text-red-500">*</span></label>
                  <select
                    name="medicoId"
                    value={formData.medicoId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white cursor-pointer text-sm"
                  >
                    <option value="">Seleccionar médico...</option>
                    {activeDoctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.nombre} {d.apellido} — {d.especialidad}
                      </option>
                    ))}
                    {/* Add editing lookup fallback if selected doctor is inactive */}
                    {editing && formData.medicoId && !activeDoctors.some(d => d.id === formData.medicoId) && (
                      <option value={formData.medicoId}>
                        {doctorMap[formData.medicoId]
                          ? `Dr. ${doctorMap[formData.medicoId].nombre} ${doctorMap[formData.medicoId].apellido} (Inactivo)`
                          : "Médico seleccionado (Inactivo)"}
                      </option>
                    )}
                  </select>
                </div>

                {/* Fecha y Hora */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Fecha <span className="text-red-500">*</span></label>
                    <input
                      name="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Hora <span className="text-red-500">*</span></label>
                    <input
                      name="hora"
                      type="time"
                      value={formData.hora}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 text-sm"
                    />
                  </div>
                </div>

                {/* Motivo de la Cita */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Motivo de la Cita <span className="text-red-500">*</span></label>
                  <textarea
                    name="motivo"
                    rows={3}
                    value={formData.motivo}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Dolor abdominal persistente, control post-operatorio..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 text-sm resize-none"
                  />
                </div>

                {/* Estado (Only when editing) */}
                {editing && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Estado de la Cita</label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-slate-700 bg-white cursor-pointer text-sm"
                    >
                      <option value="programada">Programada</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition cursor-pointer text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer text-sm"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-300 overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-700">Eliminar Cita</h3>
                <p className="text-sm text-red-500 mt-0.5">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-slate-600">
                ¿Estás seguro de que deseas eliminar la cita <span className="font-bold text-slate-800">{confirmDelete.detail}</span>?
              </p>
            </div>
            <div className="px-6 pb-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-5 py-2 border border-gray-300 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition cursor-pointer text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition cursor-pointer text-sm"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
