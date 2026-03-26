import React, { useState } from 'react';
import { Lock, User, LogIn, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [document, setDocument] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!document) newErrors.document = 'El documento es obligatorio.';
    if (!username) newErrors.username = 'El usuario es obligatorio.';
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    alert(`Datos del Formulario:\nDocumento: ${document}\nUsuario: ${username}\nContraseña: ${password}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
              <path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2a8 8 0 110 16 8 8 0 010-16z" />
              <path fill="#fff" d="M9 12h6v2H9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">HospitalIS PRO</h3>
          <p className="text-sm text-gray-500">Accede al sistema con tus credenciales</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Documento</label>
            <input
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Número de documento"
            />
            {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
          </div>

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
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-600">Contraseña</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10 pr-10"
                placeholder="Contraseña"
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>


          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer"
          >
            <LogIn className="w-4 h-4" /> Ingresar
          </button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => navigate('/forgot')}
              className="text-sm text-blue-600 hover:text-blue-800 block w-full text-center cursor-pointer"
            >
              Recuperar contraseña
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              ¿Usuario nuevo? Regístrate aquí
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;