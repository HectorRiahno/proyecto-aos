# Práctica de Hooks en React

## Integrantes del Grupo

- **Juan Meza**: useDebugValue, useState, useReducer, useRef, useImperativeHandle, useMemo, useCallback

## Tabla General de Hooks

| Hook | Descripción Corta | Categoría |
| :--- | :--- | :--- |
| `useDebugValue` | Muestra información adicional en React DevTools para debugging. | Debug |
| `useState` | Maneja el estado dentro de un componente funcional. | Estado |
| `useReducer` | Maneja estados complejos usando una función reductora. | Estado |
| `useRef` | Permite crear referencias persistentes a elementos del DOM o valores. | Referencias |
| `useImperativeHandle` | Permite personalizar la referencia expuesta a componentes padres. | Referencias |
| `useMemo` | Memoriza valores calculados para mejorar el rendimiento. | Performance |
| `useCallback` | Memoriza funciones para evitar recrearlas en cada render. | Performance |

## Explicación de los Ejercicios

### 1. useDebugValue

Creé un Hook personalizado para manejar un estado de "en línea/desconectado". `useDebugValue` permite que, al inspeccionar el componente en las React DevTools, podamos ver una etiqueta legible (ej: "En Línea") que facilita el debugging de Hooks personalizados.

### 2. useState

En este ejercicio implementé un contador básico. `useState` nos permite declarar una variable de estado (`count`) y una función para actualizarla (`setCount`). Al hacer clic en los botones, React detecta el cambio de estado y vuelve a renderizar el componente con el nuevo valor.

### 3. useReducer

Para estados más complejos o con múltiples acciones, usamos `useReducer`. Definí una función reductora que maneja las acciones `ADD`, `TOGGLE` y `DELETE`. Es similar a Redux pero a nivel de componente, ideal para una lista de tareas donde el estado depende del valor anterior.

### 4. useRef

`useRef` se usó para dos cosas:

- **Acceder al DOM**: Para poner el foco en un input automáticamente al presionar un botón.
- **Persistir valores**: Guardar cuántas veces se ha renderizado el componente sin disparar un nuevo render cada vez que el contador aumenta.

### 5. useImperativeHandle

Este Hook se utilizó junto con `forwardRef` para exponer funciones específicas de un componente hijo (como `clear` o `focus`) al componente padre. Esto permite que el padre controle el comportamiento interno del hijo de forma controlada.

### 6. useMemo

Simulé una lista de 1000 elementos. `useMemo` se encarga de que el filtrado de esa lista solo ocurra cuando el texto de búsqueda cambia. Si el componente se renderiza por otra razón (como un contador independiente), la lista filtrada no se recalcula, ahorrando recursos.

### 7. useCallback

Utilicé `useCallback` para memorizar una función de incremento que se pasa a un componente hijo memoizado (`memo`). Esto evita que el hijo se vuelva a renderizar innecesariamente cada vez que el padre cambia, ya que la referencia de la función permanece constante.
