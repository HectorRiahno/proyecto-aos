# Autenticación con Correo y Contraseña (Email-Password)

Este documento describe la implementación de la autenticación tradicional mediante correo electrónico y contraseña en el proyecto.

## Funcionalidades Implementadas

### 1. Registro de Usuario (`signup`)
Permite a los nuevos usuarios crear una cuenta proporcionando un correo y una contraseña.
- **Proceso**:
  1. Se crea el usuario en **Firebase Auth**.
  2. Se crea un documento en la colección `users` de **Firestore** con datos adicionales (teléfono, documento, rol, etc.).
  3. Se inicia automáticamente una sesión en la colección `sessions`.

### 2. Inicio de Sesión (`login`)
Permite a los usuarios existentes acceder a su cuenta.
- **Proceso**:
  1. Valida las credenciales con **Firebase Auth**.
  2. Crea un registro de sesión activa en Firestore para auditoría.

### 3. Recuperación de Contraseña (`forgot` & `reset`)
Dividido en dos etapas:
- **Olvido de contraseña**: Se envía un correo electrónico al usuario con un enlace de restablecimiento.
- **Restablecimiento**: El usuario ingresa una nueva contraseña validando el código de seguridad (`oobCode`) proporcionado en el enlace.

## Explicación del Código

### Registro de Usuario
```javascript
const signup = async (email, password, userData = {}) => {
  // 1. Crear usuario en Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // 2. Guardar datos adicionales en Firestore
  await setDoc(doc(db, "users", userCredential.user.uid), {
    uid: userCredential.user.uid,
    email: email,
    role: "user",
    status: "activo",
    createdAt: new Date(),
    // ...otros campos
  });

  // 3. Registrar sesión
  await createSessionRecord(email, userData.username || "", "correo", "");

  return userCredential;
};
```

### Inicio de Sesión
```javascript
const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  await createSessionRecord(email, userCredential.user.displayName || "", "correo", "");
  return userCredential;
};
```

### Recuperación de Contraseña
```javascript
// Paso 1: Enviar correo
const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

// Paso 2: Confirmar nueva contraseña con el código de la URL
const confirmThePasswordReset = (oobCode, newPassword) => {
  return confirmPasswordReset(auth, oobCode, newPassword);
};
```

### 4. Cierre de Sesión (`logout`)
- Finaliza la sesión en Firebase.
- Actualiza el registro de la sesión en Firestore, marcando el `logoutTime` y cambiando el estado a "finalizada".

## Archivos Relacionados
- `src/context/AuthContext.jsx`: Contiene las funciones core (`signup`, `login`, `resetPassword`, `confirmThePasswordReset`).
- `src/pages/RegisterPage.jsx`: Interfaz de registro.
- `src/pages/LoginPage.jsx`: Interfaz de login.
- `src/pages/ForgotPassword.jsx`: Interfaz para solicitar el correo de recuperación.
- `src/pages/ResetPassword.jsx`: Interfaz para ingresar la nueva contraseña.

## Consideraciones de Seguridad
- Las contraseñas son gestionadas íntegramente por Firebase Auth.
- Se implementaron validaciones de fortaleza de contraseña (mínimo 8 caracteres, mayúsculas, caracteres especiales) en las interfaces de usuario.
