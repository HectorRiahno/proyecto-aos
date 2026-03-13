# React Hooks Playground

Este proyecto es una aplicación desarrollada con **React y Vite** cuyo objetivo es **explorar y practicar el funcionamiento de diferentes Hooks de React** mediante ejemplos interactivos.

Cada hook se encuentra en una vista independiente a la que se accede mediante **React Router**, permitiendo analizar su comportamiento de forma aislada.

---

## Autor

Santiago Jose Quintero Sanchez

---

## Hooks implementados

### useSyncExternalStore

Permite suscribirse a **stores externas** de manera segura en aplicaciones con renderizado concurrente.

Es utilizado principalmente para integrar React con sistemas externos de estado como **Redux, Zustand u otras librerías**.

Garantiza que el estado leído sea consistente durante el render.

### useId

Genera **identificadores únicos y estables** que funcionan correctamente tanto en el cliente como en el servidor.

Se utiliza principalmente para:

- Asociar etiquetas `label` con `input`
- Evitar conflictos de ID en aplicaciones con **Server Side Rendering (SSR)**.

### use

Hook introducido en versiones modernas de React que permite **consumir promesas directamente dentro de componentes**.

Es utilizado principalmente en **React Server Components**, permitiendo esperar datos de forma más directa sin usar `useEffect`.

### useOptimistic

Permite realizar **actualizaciones optimistas en la interfaz**.

Esto significa que la interfaz se actualiza **antes de que el servidor confirme la operación**, mejorando la experiencia del usuario en acciones como:

- Enviar comentarios
- Dar likes
- Actualizar listas

Si la operación falla, el estado puede revertirse.

### useActionState

Se utiliza para **gestionar el estado de acciones**, especialmente en formularios o mutaciones que interactúan con el servidor.

Permite controlar:

- estado inicial
- resultado de la acción
- errores o respuestas del servidor

Es muy utilizado junto con **Server Actions en React**.

### useFormStatus

Permite conocer el **estado actual de un formulario** mientras se está enviando.

Se utiliza dentro de componentes hijos de un formulario para saber si el formulario está:

- enviándose
- pendiente
- completado

Es especialmente útil para **mostrar loaders o deshabilitar botones mientras el formulario se procesa**.

---

## Instalación del proyecto

1. Clonar el repositorio

```
git clone <url-del-repositorio>
```

2. Instalar dependencias

```
npm install
```

3. Instalar react-router
```
npm install react-router-dom
```

4. Ejecutar el servidor de desarrollo

```
npm run dev
```

---

## Ejecución

Después de iniciar el proyecto, abre en tu navegador:

```
http://localhost:5173
```