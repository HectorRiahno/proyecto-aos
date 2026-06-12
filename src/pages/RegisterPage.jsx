import React, { useState } from "react";
import { User, Lock, Eye, EyeOff, Mail, Phone, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LINK_NEEDED_TAG } from "../context/AuthContext";

function RegisterPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [telephone, setTelephone] = useState("");
  const [document, setDocument] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!telephone) {
      newErrors.telephone = "El teléfono es obligatorio.";
    } else if (!/^\d+$/.test(telephone)) {
      newErrors.telephone = "El teléfono debe contener solo números.";
    } else if (telephone.length !== 10) {
      newErrors.telephone = "Debe tener 10 dígitos.";
    }

    if (!document) {
      newErrors.document = "El documento es obligatorio.";
    } else if (!/^\d+$/.test(document)) {
      newErrors.document = "El documento debe contener solo números.";
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
    } else if (password.length < 10) {
      newErrors.password = "Debe tener al menos 10 caracteres.";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Debe contener al menos una letra mayúscula.";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "Debe contener al menos una letra minúscula.";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Debe contener al menos un número.";
    } else if (!/[^a-zA-Z0-9]/.test(password)) {
      newErrors.password = "Debe contener al menos un carácter especial (ej: !, @, #).";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await signup(email, password, { username, telephone, document });
      navigate('/');
    } catch (error) {
      // Mostrar el mensaje limpio (sin el tag interno)
      const msg = (error.message || 'Error al registrarse').replace(LINK_NEEDED_TAG, '').trim();
      setErrors({ general: msg, isLinkError: error.message?.startsWith(LINK_NEEDED_TAG) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold">Registro</h3>
        </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Teléfono</label>
              <input value={telephone} onChange={(e) => setTelephone(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="Teléfono" />
              {errors.telephone && <p className="text-red-500 text-xs">{errors.telephone}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Documento</label>
              <input value={document} onChange={(e) => setDocument(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="Documento" />
              {errors.document && <p className="text-red-500 text-xs">{errors.document}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Usuario</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="Usuario" />
              {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="Email" />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Contraseña</label>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded" placeholder="Contraseña" />
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </div>

            {/* Error simple */}
            {errors.general && !errors.isLinkError && (
              <p className="text-red-500 text-sm text-center">{errors.general}</p>
            )}

            {/* Banner de vinculación — mismo estilo que LoginPage */}
            {errors.isLinkError && (
              <div className="border border-amber-300 bg-amber-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-600 text-base">⚠️</span>
                  <p className="text-amber-800 text-sm font-semibold">Correo ya registrado</p>
                </div>
                <p className="text-amber-700 text-xs mb-3 leading-relaxed">{errors.general}</p>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Ir al login para vincular →
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed">
              <UserPlus className="w-4 h-4" /> {loading ? 'Registrando...' : 'Registrarse'}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => navigate("/")} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                ¿Ya tienes cuenta? Inicia sesión
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}

export default RegisterPage;