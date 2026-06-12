/**
 * appointmentService.js
 * Servicio CRUD para la colección "citas" en Firestore.
 * Utiliza Firebase v9 Modular con async/await.
 */

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "citas";

/**
 * Crea una nueva cita en Firestore.
 * @param {Object} appointmentData - Datos de la cita.
 * @returns {Promise<string>} - ID del documento creado.
 */
export async function createAppointment(appointmentData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      pacienteId: appointmentData.pacienteId,
      medicoId: appointmentData.medicoId,
      fecha: appointmentData.fecha,
      hora: appointmentData.hora,
      motivo: appointmentData.motivo.trim(),
      estado: appointmentData.estado || "programada",
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al crear cita:", error);
    throw error;
  }
}

/**
 * Obtiene todas las citas de Firestore ordenadas por fecha y hora desc.
 * @returns {Promise<Array>} - Array de citas con su id incluido.
 */
export async function getAppointments() {
  try {
    const q = query(collection(db, COLLECTION), orderBy("fecha", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error al obtener citas:", error);
    throw error;
  }
}

/**
 * Actualiza una cita existente en Firestore.
 * @param {string} id - ID del documento a actualizar.
 * @param {Object} appointmentData - Campos a actualizar.
 * @returns {Promise<void>}
 */
export async function updateAppointment(id, appointmentData) {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      pacienteId: appointmentData.pacienteId,
      medicoId: appointmentData.medicoId,
      fecha: appointmentData.fecha,
      hora: appointmentData.hora,
      motivo: appointmentData.motivo.trim(),
      estado: appointmentData.estado,
      fechaActualizacion: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    throw error;
  }
}

/**
 * Elimina una cita de Firestore.
 * @param {string} id - ID del documento a eliminar.
 * @returns {Promise<void>}
 */
export async function deleteAppointment(id) {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    throw error;
  }
}
