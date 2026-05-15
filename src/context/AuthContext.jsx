import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  confirmPasswordReset,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, addDoc, collection, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

//Helpers de credencial pendiente 
//Prefijo inyectado en todos los errores de vinculación — la UI lo detecta para mostrar el botón
export const LINK_NEEDED_TAG = "[VINCULAR_CUENTA]";

const PENDING_CRED_KEY  = "pendingProviderCred";
const PENDING_EMAIL_KEY = "pendingProviderEmail";

function savePendingCredential(email, credData) {
  localStorage.setItem(PENDING_CRED_KEY,  JSON.stringify(credData));
  localStorage.setItem(PENDING_EMAIL_KEY, email);
}

function clearPendingCredential() {
  localStorage.removeItem(PENDING_CRED_KEY);
  localStorage.removeItem(PENDING_EMAIL_KEY);
}

function getPendingCredential() {
  const raw   = localStorage.getItem(PENDING_CRED_KEY);
  const email = localStorage.getItem(PENDING_EMAIL_KEY);
  if (!raw || !email) return null;
  return { credData: JSON.parse(raw), email };
}

function rebuildCredential(credData) {
  // Credencial de correo/contraseña
  if (credData.type === "email") {
    return EmailAuthProvider.credential(credData.email, credData.password);
  }
  const { providerId, accessToken } = credData;
  if (providerId === "github.com")   return GithubAuthProvider.credential(accessToken);
  if (providerId === "facebook.com") return FacebookAuthProvider.credential(accessToken);
  if (providerId === "google.com")   return GoogleAuthProvider.credential(null, accessToken);
  return null;
}

/**
 * Después de un login exitoso, si hay una credencial pendiente para el mismo
 * email, la vincula a la cuenta recién autenticada y actualiza Firestore.
 * @returns {string|null} nombre del proveedor vinculado, o null si no había pendiente
 */
async function linkPendingIfAny(loggedUser) {
  const pending = getPendingCredential();
  if (!pending) return null;
  if (pending.email !== loggedUser.email) return null;

  try {
    const cred = rebuildCredential(pending.credData);
    if (!cred) return null;

    await linkWithCredential(loggedUser, cred);

    // Actualizar loginMethods en Firestore con el proveedor vinculado
    const userRef = doc(db, "users", loggedUser.uid);
    await updateDoc(userRef, {
      loginMethods: arrayUnion(pending.credData.providerName),
      updatedAt: new Date(),
    });
    console.log(`✅ Proveedor "${pending.credData.providerName}" vinculado exitosamente.`);
    return pending.credData.providerName;  // ← señal de éxito para mostrar toast
  } catch (err) {
    console.warn("No se pudo vincular el proveedor pendiente:", err.message);
    return null;
  } finally {
    clearPendingCredential();
  }
}

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
    let userCredential;
    try {
      // Intentar crear el usuario en Firebase Auth
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        // El email ya existe con un proveedor social → guardar credencial pendiente
        savePendingCredential(email, {
          type:         "email",
          providerName: "correo",
          email,
          password,
        });

        // Resolver qué proveedores tiene registrados
        let providerMsg = "con otro proveedor";
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          const names = methods
            .filter((m) => m !== "password")
            .map((m) => {
              if (m === "google.com")   return "Google";
              if (m === "github.com")   return "GitHub";
              if (m === "facebook.com") return "Facebook";
              return m;
            })
            .join(", ");
          if (names) providerMsg = `con: ${names}`;
        } catch (_) {}

        throw new Error(
          `${LINK_NEEDED_TAG} Este correo ya está registrado ${providerMsg}. Inicia sesión con ese proveedor para vincular tu cuenta automáticamente.`
        );
      }
      throw error;
    }

    // Guardar datos adicionales en Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid:          userCredential.user.uid,
      email:        email,
      username:     userData.username  || "",
      telephone:    userData.telephone || "",
      document:     userData.document  || "",
      loginMethod:  "correo",
      loginMethods: arrayUnion("correo"),
      photoURL:     userData.photoURL  || "",
      role:         "user",
      status:       "activo",
      createdAt:    new Date(),
      updatedAt:    new Date(),
    });

    // Registrar sesión
    await createSessionRecord(email, userData.username || "", "correo", userData.photoURL || "");

    return userCredential;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Obtener datos del usuario desde Firestore para el registro de sesión
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    // Registrar sesión con datos completos
    await createSessionRecord(
      email, 
      userData.username || user.displayName || "", 
      "correo", 
      userData.photoURL || user.photoURL || ""
    );

    return userCredential;
  };

  const logout = async () => {
    // Cerrar el registro de sesión
    await closeSessionRecord(sessionId);

    await signOut(auth);
  };

  const loginWithGoogle = async () => {
    const googleProvider = new GoogleAuthProvider();
    let userCredential;
    try {
      userCredential = await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData?.email;
        const cred  = GoogleAuthProvider.credentialFromError(error);
        if (cred && email) {
          savePendingCredential(email, {
            providerId:   cred.providerId,
            providerName: "google",
            accessToken:  cred.accessToken,
          });
        }
        const providerMsg = await resolveProviderNames(email);
        throw new Error(
          `${LINK_NEEDED_TAG} Este email ya tiene cuenta. Inicia sesión con ${providerMsg} para vincularlas.`
        );
      }
      throw error;
    }

    // Guardar datos del usuario en Firestore (Modo Seguro)
    const userRef  = doc(db, "users", userCredential.user.uid);
    const userSnap = await getDoc(userRef);
    const existingData = userSnap.exists() ? userSnap.data() : {};

    const userDataToSave = {
      uid:          userCredential.user.uid,
      email:        userCredential.user.email,
      displayName:  existingData.displayName || userCredential.user.displayName || "",
      photoURL:     existingData.photoURL    || userCredential.user.photoURL    || "",
      username:     existingData.username    || userCredential.user.displayName || "",
      telephone:    existingData.telephone   || "",
      document:     existingData.document    || "",
      loginMethod:  existingData.loginMethod || "google", 
      loginMethods: arrayUnion("google"),
      role:         existingData.role        || "user",
      status:       existingData.status      || "activo",
      updatedAt:    new Date(),
    };

    if (!userSnap.exists()) {
      userDataToSave.createdAt = new Date();
    }

    await setDoc(userRef, userDataToSave, { merge: true });

    // Registrar sesión
    await createSessionRecord(
      userCredential.user.email,
      userCredential.user.displayName || "",
      "google",
      userCredential.user.photoURL || ""
    );

    // Vincular cualquier proveedor pendiente
    await linkPendingIfAny(userCredential.user);

    return userCredential;
  };

  const loginWithGitHub = async () => {
    const githubProvider = new GithubAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, githubProvider);
      const { user } = userCredential;

      // Guardar datos del usuario en Firestore (Modo Seguro)
      const userRef  = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const existingData = userSnap.exists() ? userSnap.data() : {};

      const userDataToSave = {
        uid:          user.uid,
        email:        user.email,
        displayName:  existingData.displayName || user.displayName || "",
        photoURL:     existingData.photoURL    || user.photoURL    || "",
        username:     existingData.username    || user.displayName || "",
        loginMethod:  existingData.loginMethod || "github",
        loginMethods: arrayUnion("github"),
        updatedAt:    new Date(),
      };

      if (!userSnap.exists()) {
        userDataToSave.role      = "user";
        userDataToSave.status    = "activo";
        userDataToSave.createdAt = new Date();
      }

      await setDoc(userRef, userDataToSave, { merge: true });

      await createSessionRecord(
        user.email,
        user.displayName || "",
        "github",
        user.photoURL || ""
      );

      // ✅ Vincular cualquier proveedor pendiente
      const linked = await linkPendingIfAny(user);
      if (linked) setLinkedProvider(linked);

      return userCredential;

    } catch (error) {
      if (error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData?.email;
        const cred  = GithubAuthProvider.credentialFromError(error);

        if (cred && email) {
          savePendingCredential(email, {
            providerId:   cred.providerId,
            providerName: "github",
            accessToken:  cred.accessToken,
          });
        }

        const providerMsg = await resolveProviderNames(email);
        throw new Error(
          `${LINK_NEEDED_TAG} Este email ya tiene cuenta. Inicia sesión con ${providerMsg} para vincularlas.`
        );
      }
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    const facebookProvider = new FacebookAuthProvider();
    facebookProvider.addScope('email'); // Forzar solicitud de email
    try {
      const userCredential = await signInWithPopup(auth, facebookProvider);
      const { user } = userCredential;

      // Guardar datos del usuario en Firestore (Modo Seguro)
      const userRef  = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const existingData = userSnap.exists() ? userSnap.data() : {};

      const userDataToSave = {
        uid:          user.uid,
        email:        user.email,
        displayName:  existingData.displayName || user.displayName || "",
        photoURL:     existingData.photoURL    || user.photoURL    || "",
        username:     existingData.username    || user.displayName || "",
        loginMethod:  existingData.loginMethod || "facebook",
        loginMethods: arrayUnion("facebook"),
        updatedAt:    new Date(),
      };

      if (!userSnap.exists()) {
        userDataToSave.role      = "user";
        userDataToSave.status    = "activo";
        userDataToSave.createdAt = new Date();
      }

      await setDoc(userRef, userDataToSave, { merge: true });

      await createSessionRecord(
        user.email,
        user.displayName || "",
        "facebook",
        user.photoURL || ""
      );

      // Vincular cualquier proveedor pendiente
      await linkPendingIfAny(user);

      return userCredential;
    } catch (error) {
      if (error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData?.email;
        const cred  = FacebookAuthProvider.credentialFromError(error);

        if (cred && email) {
          savePendingCredential(email, {
            providerId:   cred.providerId,
            providerName: "facebook",
            accessToken:  cred.accessToken,
          });
        }

        const providerMsg = await resolveProviderNames(email);
        throw new Error(
          `${LINK_NEEDED_TAG} Este email ya tiene cuenta. Inicia sesión con ${providerMsg} para vincularlas.`
        );
      }
      throw error;
    }
  };

  // Helper: construye el mensaje de proveedores existentes
  const resolveProviderNames = async (email) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      const names = methods.map((m) => {
        if (m === "google.com")   return "Google";
        if (m === "github.com")   return "GitHub";
        if (m === "facebook.com") return "Facebook";
        if (m === "password")     return "correo y contraseña";
        return m;
      }).join(", ");
      return names || "otro método";
    } catch (_) {
      return "otro método";
    }
  };

  const resetPassword = (email) => {
    const actionCodeSettings = {
      url: window.location.origin + "/reset",
      handleCodeInApp: true,
    };
    return sendPasswordResetEmail(auth, email, actionCodeSettings);
  };

  const confirmThePasswordReset = (oobCode, newPassword) => {
    return confirmPasswordReset(auth, oobCode, newPassword);
  };

  useEffect(() => {
    const unsuscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Obtener datos adicionales de Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          // Mergear datos de Firestore en el objeto de usuario
          // Usamos un objeto nuevo para evitar problemas con las propiedades read-only de currentUser
          const enhancedUser = {
            ...currentUser,
            username: userData.username,
            photoURL: userData.photoURL || currentUser.photoURL,
            role: userData.role,
            telephone: userData.telephone,
          };
          setUser(enhancedUser);
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
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
        loginWithFacebook,
        resetPassword,
        confirmThePasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;