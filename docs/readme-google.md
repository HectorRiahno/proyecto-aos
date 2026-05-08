# Autenticación con Google

La autenticación con Google permite a los usuarios iniciar sesión de forma rápida utilizando sus cuentas de Google existentes.

## Flujo de Trabajo

### 1. Inicio de Sesión (`loginWithGoogle`)
Utiliza el proveedor `GoogleAuthProvider` de Firebase para abrir un popup de autenticación.

### 2. Gestión de Datos en Firestore
Cada vez que un usuario inicia sesión con Google:
- Se verifica si el usuario ya existe en la colección `users`.
- Si es nuevo, se crea un perfil básico con su `photoURL`, `email` y `displayName`.
- Si ya existe, se actualizan los métodos de inicio de sesión (`loginMethods`) y la fecha de última actualización.

### 3. Vinculación de Cuentas (Account Linking)
Una característica especial de esta implementación es la capacidad de vincular una cuenta de GitHub pendiente.
- Si el usuario intentó iniciar sesión con GitHub previamente y falló debido a que el correo ya estaba registrado con Google, el sistema guarda la credencial de GitHub de forma temporal.
- Al completar el inicio de sesión con Google, el sistema detecta la credencial pendiente y vincula ambas cuentas automáticamente usando `linkWithCredential`.

### 4. Registro de Sesión
Se genera un registro en la colección `sessions` indicando que el proveedor utilizado fue "google".

## Explicación del Código

### Login con Google y Sincronización
```javascript
const loginWithGoogle = async () => {
  const googleProvider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, googleProvider);

  // Guardar/Actualizar datos del usuario en Firestore
  const userRef = doc(db, "users", userCredential.user.uid);
  const userDataToSave = {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    displayName: userCredential.user.displayName || "",
    loginMethods: arrayUnion("google"),
    updatedAt: new Date(),
  };

  await setDoc(userRef, userDataToSave, { merge: true });
  
  // Registrar sesión
  await createSessionRecord(
    userCredential.user.email,
    userCredential.user.displayName || "",
    "google",
    userCredential.user.photoURL || ""
  );
  
  // ... Lógica de Account Linking
  return userCredential;
};
```

### Lógica de Vinculación (GitHub)
Esta lógica permite unificar cuentas cuando se detecta el mismo correo:
```javascript
const pendingCredRaw = localStorage.getItem("pendingGithubCred");
const pendingEmail = localStorage.getItem("pendingGithubEmail");

if (pendingCredRaw && pendingEmail === userCredential.user.email) {
  const pendingCredData = JSON.parse(pendingCredRaw);
  const pendingCred = GithubAuthProvider.credential(pendingCredData.accessToken);
  
  // Vincula la cuenta de Google actual con la credencial de GitHub guardada
  await linkWithCredential(userCredential.user, pendingCred);
  
  localStorage.removeItem("pendingGithubCred");
}
```

## Archivos Relacionados
- `src/context/AuthContext.jsx`: Función `loginWithGoogle`.
- `src/pages/LoginPage.jsx`: Botón de "Continuar con Google".

## Configuración en Firebase
Para que esto funcione, el método de inicio de sesión "Google" debe estar habilitado en la consola de Firebase bajo la sección **Authentication > Sign-in method**.
