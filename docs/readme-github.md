# Autenticación con GitHub

La autenticación con GitHub permite a los desarrolladores y usuarios acceder utilizando sus cuentas de GitHub.

## Flujo de Trabajo

### 1. Inicio de Sesión (`loginWithGitHub`)
Utiliza `GithubAuthProvider` y abre un popup para que el usuario autorice la aplicación.

### 2. Persistencia en Firestore
- Crea o actualiza el perfil del usuario en la colección `users`.
- Almacena el `email`, `displayName` (como `username`) y la `photoURL`.
- Añade "github" al arreglo `loginMethods`.

### 3. Manejo de Conflictos y Vinculación
GitHub es a menudo el proveedor que genera conflictos cuando un usuario ya tiene una cuenta con el mismo correo (por ejemplo, vía Google).
- **Detección**: Si ocurre el error `auth/account-exists-with-different-credential`, el sistema captura la credencial de GitHub.
- **Preparación**: La credencial se guarda temporalmente en `localStorage` (`pendingGithubCred`).
- **Resolución**: Se informa al usuario que debe iniciar sesión con su proveedor original (Google o Email). Al hacerlo, el sistema completará la vinculación automáticamente (ver `readme-google.md`).

## Explicación del Código

### Login y Registro de Sesión
```javascript
const loginWithGitHub = async () => {
  const githubProvider = new GithubAuthProvider();
  try {
    const userCredential = await signInWithPopup(auth, githubProvider);
    const { user } = userCredential;

    // Guardar en Firestore
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      username: user.displayName || "",
      loginMethods: arrayUnion("github"),
      updatedAt: new Date(),
    }, { merge: true });

    // Registrar sesión
    await createSessionRecord(user.email, user.displayName || "", "github", user.photoURL || "");

    return userCredential;
  } catch (error) {
    if (error.code === "auth/account-exists-with-different-credential") {
      // Guardar credencial para vinculación posterior
      const pendingCred = GithubAuthProvider.credentialFromError(error);
      localStorage.setItem("pendingGithubCred", JSON.stringify(pendingCred));
      
      throw new Error("Este correo ya está registrado. Inicia sesión con el proveedor original.");
    }
    throw error;
  }
};
```

## Archivos Relacionados
- `src/context/AuthContext.jsx`: Función `loginWithGitHub`.
- `src/pages/LoginPage.jsx`: Botón de "Continuar con GitHub".

## Configuración en GitHub
1. Ve a **Settings > Developer settings > OAuth Apps** en GitHub.
2. Crea una nueva aplicación y obtén el **Client ID** y **Client Secret**.
3. Configura la **Authorization callback URL** con la que te proporciona Firebase en su consola.
