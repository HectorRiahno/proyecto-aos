import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth, db } from "../firebase";
import { doc, setDoc, addDoc, collection, updateDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("There isnt authprovider");
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  // Función para crear un registro de sesión
  const createSessionRecord = async (userEmail, userName, authMethod) => {
    try {
      const sessionRef = await addDoc(collection(db, "sessions"), {
        email: userEmail,
        username: userName || "",
        provider: authMethod,
        status: "activa",
        loginTime: new Date(),
        logoutTime: null,
        duration: null,
      });
      // Guardar sessionId en localStorage
      localStorage.setItem("currentSessionId", sessionRef.id);
      setSessionId(sessionRef.id);
      return sessionRef.id;
    } catch (error) {
      console.error("Error creando sesión:", error);
    }
  };

  // Función para cerrar un registro de sesión
  const closeSessionRecord = async (sessionDocId) => {
    try {
      // Si no se proporciona sessionId, intentar obtenerlo de localStorage
      const idToClose = sessionDocId || localStorage.getItem("currentSessionId");
      
      if (!idToClose) return;

      const sessionRef = doc(db, "sessions", idToClose);
      const logoutTime = new Date();

      await updateDoc(sessionRef, {
        logoutTime: logoutTime,
        status: "finalizada",
      });

      // Limpiar localStorage
      localStorage.removeItem("currentSessionId");
      setSessionId(null);
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  const signup = async (email, password, userData = {}) => {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Guardar datos adicionales en Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      username: userData.username || "",
      telephone: userData.telephone || "",
      document: userData.document || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Registrar sesión
    await createSessionRecord(email, userData.username || "", "correo");

    return userCredential;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Registrar sesión
    await createSessionRecord(email, userCredential.user.displayName || "", "correo");

    return userCredential;
  };

  const logout = async () => {
    // Cerrar el registro de sesión
    await closeSessionRecord(sessionId);

    await signOut(auth);
  };

  const loginWithGoogle = async () => {
    const googleProvider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, googleProvider);

    // Guardar datos del usuario en Firestore si es la primera vez
    await setDoc(
      doc(db, "users", userCredential.user.uid),
      {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || "",
        photoURL: userCredential.user.photoURL || "",
        username: userCredential.user.displayName || "",
        telephone: "",
        document: "",
        loginMethod: "google",
        updatedAt: new Date(),
      },
      { merge: true }
    );

    // Registrar sesión con Google
    await createSessionRecord(
      userCredential.user.email,
      userCredential.user.displayName || "",
      "google"
    );

    return userCredential;
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsuscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsuscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signup,
        login,
        user,
        logout,
        loading,
        loginWithGoogle,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;