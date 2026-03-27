# HospitalIS PRO - Proyecto AOS

Este proyecto es una aplicación web desarrollada con **React 19** y **Vite**, enfocada en la gestión hospitalaria. Forma parte de la asignatura de **Arquitectura Orientada a Servicios (AOS)**, en la cual se realizara un sistema de autenticación y gestión de usuarios, usando **Firebase** como backend.

HospitalIS Pro es un sistema web hospitalario completo que permite gestionar de forma integral la información médica y administrativa tanto para pacientes como para empleados. Los pacientes pueden consultar sus citas, historial clínico, medicamentos, resultados de exámenes, documentos y actualizar su perfil, mientras que los empleados cuentan con herramientas para administrar citas, pacientes, inventario, reportes y configuraciones del sistema. Incluye dashboards con estadísticas, funcionalidades de visualización y descarga de información, y un diseño moderno y consistente, logrando una plataforma totalmente funcional que centraliza y optimiza los procesos del entorno de salud.

## Integrantes del Equipo

- **Juan Sebastian Meza Garcia**
- **Santiago Jose Quintero Sanchez**
- **Hector José Riaño Lopez**

## Tecnologías Utilizadas

- **Frontend Core**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **Iconos**: Lucide React y React Icons

## Estructura del Proyecto

El código fuente se organiza siguiendo las mejores prácticas para aplicaciones escalables:

```text
proyecto-aos/
├── public/              # Archivos estáticos
├── src/
│   ├── assets/          # Imágenes y recursos multimedia
│   ├── pages/           # Páginas de autenticación (Login, Registro, etc.)
│   ├── playground/      # Implementaciones prácticas de Hooks de React
│   ├── App.jsx          # Componente principal y Router
│   ├── main.jsx         # Punto de entrada de la aplicación
│   └── index.css        # Estilos globales y Tailwind CSS
├── index.html           # Plantilla HTML base
├── vite.config.js       # Configuración de Vite
└── package.json         # Dependencias y scripts
```

## Instalación y Ejecución

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### 1. Clonar el repositorio

```bash
git clone https://github.com/HectorRiahno/proyecto-aos.git
cd proyecto-aos
```

### 2. Instalar dependencias

Asegúrate de tener un gestor de paquetes (npm o yarn) instalado:

```bash
npm install
```

### 3. Ejecutar en modo desarrollo

Inicia el servidor local de Vite:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto indicado por la terminal).
