# Autenticación con Facebook

La integración con Facebook permite a los usuarios utilizar su perfil de Facebook para acceder a la plataforma.

## Detalles de Implementación

### 1. Proveedor de Autenticación (`loginWithFacebook`)
Utiliza `FacebookAuthProvider` y el método `signInWithPopup`.

### 2. Sincronización con Firestore
- Extrae el `displayName`, `email` y `photoURL` del perfil de Facebook.
- Crea o actualiza el documento del usuario en la colección `users`, añadiendo "facebook" a la lista de `loginMethods`.

### 3. Manejo de Conflictos de Correo
Firebase no permite tener dos cuentas con el mismo correo electrónico pero diferentes proveedores si la configuración de "Un solo correo por cuenta" está activada.
- Si un usuario intenta entrar con Facebook pero su correo ya está registrado con Google o Contraseña, el sistema captura el error `auth/account-exists-with-different-credential`.
- Se muestra un mensaje informativo al usuario indicando con qué proveedor debe iniciar sesión originalmente para evitar duplicidad.

### 4. Registro de Sesiones
Al igual que los otros métodos, se registra la actividad en la colección `sessions` con el proveedor marcado como "facebook".

## Explicación del Código

### Login con Facebook y Manejo de Errores
```javascript
const loginWithFacebook = async () => {
  const facebookProvider = new FacebookAuthProvider();
  try {
    const userCredential = await signInWithPopup(auth, facebookProvider);
    const { user } = userCredential;

    // Guardar datos del usuario en Firestore
    const userRef = doc(db, "users", user.uid);
    const userDataToSave = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      loginMethods: arrayUnion("facebook"),
      updatedAt: new Date(),
    };

    await setDoc(userRef, userDataToSave, { merge: true });

    // Registrar sesión
    await createSessionRecord(user.email, user.displayName || "", "facebook", user.photoURL || "");

    return userCredential;
  } catch (error) {
    // Si el correo ya existe con otro proveedor (Google/Email)
    if (error.code === "auth/account-exists-with-different-credential") {
      const email = error.customData?.email;
      // ... lógica para informar al usuario sobre el proveedor correcto
      throw new Error(`Este correo ya está registrado con otro proveedor.`);
    }
    throw error;
  }
};
```

## Archivos Relacionados
- `src/context/AuthContext.jsx`: Función `loginWithFacebook`.
- `src/pages/LoginPage.jsx`: Botón de "Continuar con Facebook".

## Requisitos Previos
1. Tener una aplicación creada en el [Facebook Developers Portal](https://developers.facebook.com/).
2. Configurar el **App ID** y **App Secret** en la consola de Firebase.
3. Añadir la URL de redirección de OAuth proporcionada por Firebase en la configuración de "Facebook Login" dentro del portal de desarrolladores de Facebook.
