import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, Mail, Phone, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const navigate = useNavigate();

  const [telephone, setTelephone] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!telephone) {
      newErrors.telephone = "El teléfono es obligatorio.";
    } else if (telephone.length !== 10) {
      newErrors.telephone = "Debe tener 10 dígitos.";
    }

    if (!username) {
      newErrors.username = "El usuario es obligatorio.";
    } else if (username.length < 3) {
      newErrors.username = "Debe tener al menos 3 caracteres.";
    }

    if (!email) {
      newErrors.email = "El email es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email inválido.";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      newErrors.password = "Debe tener al menos 6 caracteres.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    alert(
      `Datos del formulario:\nTeléfono: ${telephone}\nUsuario: ${username}\nEmail: ${email}\nContraseña: ${password}`
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold">Registro</h3>
          <p className="text-sm text-gray-500">
            Crea tu cuenta para continuar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Teléfono */}
          <div>
            <label className="text-sm text-gray-600">Teléfono</label>
            <div className="mt-1 relative">
              <input
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                placeholder="Número de teléfono"
              />
              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
            {errors.telephone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.telephone}
              </p>
            )}
          </div>

          {/* Usuario */}
          <div>
            <label className="text-sm text-gray-600">Usuario</label>
            <div className="mt-1 relative">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                placeholder="Usuario"
              />
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <div className="mt-1 relative">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                placeholder="Correo electrónico"
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="text-sm text-gray-600">Contraseña</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 pr-10"
                placeholder="Contraseña"
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Registrarse
          </button>

          {/* Navegación */}
          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;