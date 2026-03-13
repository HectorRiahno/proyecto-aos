# React Hooks Playground

Este proyecto es una aplicación desarrollada con **React y Vite** cuyo objetivo es **explorar y practicar el funcionamiento de los diferentes Hooks de React** mediante ejemplos interactivos.

Cada hook se encuentra en una vista independiente a la que se accede mediante **React Router**, permitiendo analizar su comportamiento de forma aislada.

---

## Autor

Héctor 

## Hooks implementados

### useState

Permite crear y manejar estado dentro de un componente funcional.

### useReducer

Se utiliza para manejar estados complejos mediante un patrón similar a Redux basado en acciones y reducers.

### useRef

Permite crear referencias a elementos del DOM o almacenar valores persistentes sin provocar renders.

### useImperativeHandle

Se utiliza junto con `forwardRef` para personalizar los métodos expuestos por un componente hijo.

### useMemo

Memoriza el resultado de una operación costosa para evitar cálculos innecesarios en cada render.

### useCallback

Memoriza funciones para evitar que se vuelvan a crear en cada render, optimizando componentes hijos memorizados.

### useTransition

Permite marcar actualizaciones como **no urgentes**, mejorando la experiencia de usuario cuando hay renders pesados.

### useDeferredValue

Retrasa la actualización de valores para evitar bloqueos en la interfaz.

### useEffect

Permite ejecutar efectos secundarios después del render del componente, como llamadas a APIs o manipulaciones del DOM.

### useLayoutEffect

Similar a `useEffect`, pero se ejecuta **antes de que el navegador pinte los cambios en pantalla**.

### useInsertionEffect

Hook especializado utilizado principalmente por librerías de estilos para insertar CSS antes del render.

### useContext

Permite compartir información entre componentes sin necesidad de pasar props manualmente.

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




