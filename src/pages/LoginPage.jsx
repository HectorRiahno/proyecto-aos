import React, { useState } from 'react';
import { Lock, User, LogIn, Eye, EyeOff, Hospital } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
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
  const [githubConflict, setGithubConflict] = useState(false);

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
const { loginWithGoogle, loginWithGitHub } = useAuth();

const handleGoogleLogin = async () => {
  try {
    await loginWithGoogle();
    navigate('/Home');
  } catch (error) {
    console.log(error);
    setError('Error al iniciar con Google');
  }
};

const handleGitHubLogin = async () => {
  setGithubConflict(false);
  setError('');
  try {
    await loginWithGitHub();
    navigate('/Home');
  } catch (error) {
    if (error.message?.includes('ya está registrado')) {
      setGithubConflict(true);
    } else {
      setError(error.message || 'Error al iniciar con GitHub');
    }
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">

        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white mb-3">
            <Hospital size={28} />
          </div>
          <h3 className="text-lg font-semibold">HospitalIS PRO</h3>
          <p className="text-sm text-gray-500">
            Accede al sistema con tus credenciales
          </p>
        </div>

        {/* Conflicto de cuenta GitHub */}
        {githubConflict && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-3 text-sm">
            <p className="text-amber-800 font-medium mb-1">⚠️ Correo ya registrado</p>
            <p className="text-amber-700 mb-2">
              Tu correo ya tiene cuenta con Google. Inicia sesión con Google para vincular GitHub automáticamente.
            </p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Iniciar con Google y vincular GitHub
            </button>
          </div>
        )}

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
                className="w-full p-2 border border-gray-300 rounded pl-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                className="w-full p-2 border border-gray-300 rounded pl-10 pr-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Contraseña"
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer disabled:cursor-not-allowed"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition font-medium cursor-pointer"
          >
            <FcGoogle className="w-5 h-5" />
            Continuar con Google
          </button>

          <button
            type="button"
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition font-medium cursor-pointer"
          >
            <FaGithub className="w-5 h-5 text-gray-800" />
            Continuar con GitHub
          </button>

          {/* Links */}
          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => navigate('/forgot')}
              className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
              Recuperar contraseña
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-sm text-blue-600 hover:underline cursor-pointer"
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