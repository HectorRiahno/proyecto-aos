import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  linkWithCredential,
  fetchSignInMethodsForEmail,
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
  const createSessionRecord = async (userEmail, userName, authMethod, photoURL) => {
    try {
      const sessionRef = await addDoc(collection(db, "sessions"), {
        email: userEmail,
        username: userName || "",
        provider: authMethod,
        photoURL: photoURL || "",
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
    await createSessionRecord(email, userData.username || "", "correo", "");

    return userCredential;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Registrar sesión
    await createSessionRecord(email, userCredential.user.displayName || "", "correo", "");

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
      "google",
      userCredential.user.photoURL || ""
    );

    // ✅ Vincular GitHub pendiente si el usuario intentó entrar por GitHub antes
    const pendingCredRaw = localStorage.getItem("pendingGithubCred");
    const pendingEmail = localStorage.getItem("pendingGithubEmail");

    if (pendingCredRaw && pendingEmail === userCredential.user.email) {
      try {
        const { OAuthProvider } = await import("firebase/auth");
        const pendingCredData = JSON.parse(pendingCredRaw);
        const pendingCred = GithubAuthProvider.credential(
          pendingCredData.accessToken
        );
        await linkWithCredential(userCredential.user, pendingCred);
        console.log("✅ GitHub vinculado exitosamente a la cuenta de Google.");
      } catch (linkError) {
        console.warn("No se pudo vincular GitHub:", linkError.message);
      } finally {
        localStorage.removeItem("pendingGithubCred");
        localStorage.removeItem("pendingGithubEmail");
      }
    }

    return userCredential;
  };

  const loginWithGitHub = async () => {
    const githubProvider = new GithubAuthProvider();

    try {
      const userCredential = await signInWithPopup(auth, githubProvider);
      const { user } = userCredential;

      // Guardar datos del usuario en Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          username: user.displayName || "",
          telephone: "",
          document: "",
          loginMethod: "github",
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // Registrar sesión — misma foto/nombre sin importar el proveedor
      await createSessionRecord(
        user.email,
        user.displayName || "",
        "github",
        user.photoURL || ""
      );

      return userCredential;

    } catch (error) {
      // El correo ya existe con otro proveedor → hacer account linking
      if (error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData?.email;
        const pendingCred = GithubAuthProvider.credentialFromError(error);

        // Guardar credencial pendiente para usarla después del login con el otro proveedor
        if (pendingCred) {
          localStorage.setItem("pendingGithubCred", JSON.stringify(pendingCred));
        }
        if (email) {
          localStorage.setItem("pendingGithubEmail", email);
        }

        // Intentar obtener los proveedores (puede estar vacío si Firebase tiene
        // la protección de enumeración de emails activada)
        let providerNames = "";
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          providerNames = methods.map(m => {
            if (m === "google.com") return "Google";
            if (m === "password") return "correo y contraseña";
            if (m === "github.com") return "GitHub";
            return m;
          }).join(", ");
        } catch (_) { /* ignorar si falla */ }

        const providerMsg = providerNames
          ? `con: ${providerNames}`
          : "con otro proveedor (Google o correo)";

        throw new Error(
          `Este correo ya está registrado ${providerMsg}. Inicia sesión con ese proveedor primero.`
        );
      }

      throw error;
    }
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
        loginWithGitHub,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;