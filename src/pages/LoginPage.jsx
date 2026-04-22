import React, { useState } from 'react';
import { Lock, User, LogIn, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación mínima (solo campos vacíos)
    if (!email || !password) {
      return setError('Todos los campos son obligatorios');
    }

    setError('');
    setLoading(true); 

    try {
      await login(email, password);
      navigate('/Home'); 
    } catch (err) {
      console.log(err);

      //  manejo de errores con firebase 
      switch (err.code) {
        case 'auth/user-not-found':
          setError('El usuario no existe');
          break;
        case 'auth/wrong-password':
          setError('Contraseña incorrecta');
          break;
        case 'auth/invalid-email':
          setError('Email inválido');
          break;
        case 'auth/too-many-requests':
          setError('Demasiados intentos. Intenta más tarde');
          break;
        default:
          setError('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

// Google Login
const { loginWithGoogle } = useAuth();

const handleGoogleLogin = async () => {
  try {
    await loginWithGoogle();
    navigate('/Home');
  } catch (error) {
    console.log(error);
    setError('Error al iniciar con Google');
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">

        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white mb-3">
            <LogIn />
          </div>
          <h3 className="text-lg font-semibold">HospitalIS PRO</h3>
          <p className="text-sm text-gray-500">
            Accede al sistema con tus credenciales
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <div className="mt-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded pl-10 focus:ring-2 focus:ring-blue-500"
                placeholder="tu@email.com"
              />
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-600">Contraseña</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded pl-10 pr-10 focus:ring-2 focus:ring-blue-500"
                placeholder="Contraseña"
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Continuar con Google
          </button>

          {/* Links */}
          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => navigate('/forgot')}
              className="text-sm text-blue-600 hover:underline"
            >
              Recuperar contraseña
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-sm text-blue-600 hover:underline"
            >
              ¿Usuario nuevo? Regístrate
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default LoginPage;