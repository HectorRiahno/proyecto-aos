/**
 * doctorService.js
 * Servicio CRUD para la colección "doctores" en Firestore.
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

const COLLECTION = "doctores";

/**
 * Crea un nuevo doctor en Firestore.
 * @param {Object} doctorData - Datos del doctor (sin id ni fechaCreacion).
 * @returns {Promise<string>} - ID del documento creado.
 */
export async function createDoctor(doctorData) {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      nombre: doctorData.nombre.trim(),
      apellido: doctorData.apellido.trim(),
      especialidad: doctorData.especialidad.trim(),
      telefono: doctorData.telefono.trim(),
      correo: doctorData.correo.trim(),
      direccion: doctorData.direccion.trim(),
      estado: doctorData.estado ?? true,
      fechaCreacion: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al crear doctor:", error);
    throw error;
  }
}

/**
 * Obtiene todos los doctores de Firestore ordenados por apellido.
 * @returns {Promise<Array>} - Array de doctores con su id incluido.
 */
export async function getDoctors() {
  try {
    const q = query(collection(db, COLLECTION), orderBy("apellido", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error al obtener doctores:", error);
    throw error;
  }
}

/**
 * Actualiza un doctor existente en Firestore.
 * @param {string} id - ID del documento a actualizar.
 * @param {Object} doctorData - Campos a actualizar.
 * @returns {Promise<void>}
 */
export async function updateDoctor(id, doctorData) {
  try {
    const docRef = doc(db, COLLECTION, id);
    await updateDoc(docRef, {
      nombre: doctorData.nombre.trim(),
      apellido: doctorData.apellido.trim(),
      especialidad: doctorData.especialidad.trim(),
      telefono: doctorData.telefono.trim(),
      correo: doctorData.correo.trim(),
      direccion: doctorData.direccion.trim(),
      estado: doctorData.estado ?? true,
    });
  } catch (error) {
    console.error("Error al actualizar doctor:", error);
    throw error;
  }
}

/**
 * Elimina un doctor de Firestore.
 * @param {string} id - ID del documento a eliminar.
 * @returns {Promise<void>}
 */
export async function deleteDoctor(id) {
  try {
    await deleteDoc(doc(db, COLLECTION, id));
  } catch (error) {
    console.error("Error al eliminar doctor:", error);
    throw error;
  }
}
