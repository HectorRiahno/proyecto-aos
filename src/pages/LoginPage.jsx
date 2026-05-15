import React, { useState } from 'react';
import { Lock, User, LogIn, Eye, EyeOff, Hospital } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaFacebook } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth, LINK_NEEDED_TAG } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithGitHub, loginWithFacebook } = useAuth();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [isLinkError, setIsLinkError]   = useState(false);

  /** Normaliza cualquier error: detecta si requiere vinculación */
  const handleAuthError = (err) => {
    if (err.message?.startsWith(LINK_NEEDED_TAG)) {
      setIsLinkError(true);
      setError(err.message.replace(LINK_NEEDED_TAG, '').trim());
    } else {
      setIsLinkError(false);
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  const resetErrors = () => { setError(''); setIsLinkError(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Todos los campos son obligatorios');
    resetErrors();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/Home');
    } catch (err) {
      const msgs = {
        'auth/user-not-found':    'El usuario no existe',
        'auth/wrong-password':    'Contraseña incorrecta',
        'auth/invalid-email':     'Email inválido',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
        'auth/invalid-credential':'Credenciales incorrectas',
      };
      setError(msgs[err.code] || err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    resetErrors();
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/Home');
    } catch (err) { handleAuthError(err); }
    finally { setLoading(false); }
  };

  const handleGitHubLogin = async () => {
    resetErrors();
    setLoading(true);
    try {
      await loginWithGitHub();
      navigate('/Home');
    } catch (err) { handleAuthError(err); }
    finally { setLoading(false); }
  };

  const handleFacebookLogin = async () => {
    resetErrors();
    setLoading(true);
    try {
      await loginWithFacebook();
      navigate('/Home');
    } catch (err) { handleAuthError(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">

        {/* Header */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white mb-3">
            <Hospital size={28} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">HospitalIS PRO</h3>
          <p className="text-sm text-gray-500">Accede al sistema con tus credenciales</p>
        </div>

        {/* ── Banner de vinculación (Solo informativo) ─────────────────── */}
        {isLinkError && (
          <div className="mb-4 border border-amber-300 bg-amber-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-600 text-base">⚠️</span>
              <p className="text-amber-800 text-sm font-bold">Email ya registrado</p>
            </div>
            <p className="text-amber-700 text-xs leading-relaxed">
              {error}
            </p>
          </div>
        )}

        {/* Error simple (sin vinculación) */}
        {error && !isLinkError && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        {/* ── Formulario ──────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4">

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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer disabled:cursor-not-allowed font-medium transition"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          {/* Separador */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">o continúa con</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition font-medium cursor-pointer text-sm"
          >
            <FcGoogle className="w-5 h-5" /> Continuar con Google
          </button>

          <button
            type="button"
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition font-medium cursor-pointer text-sm"
          >
            <FaGithub className="w-5 h-5 text-gray-800" /> Continuar con GitHub
          </button>

          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition font-medium cursor-pointer text-sm"
          >
            <FaFacebook className="w-5 h-5 text-blue-600" /> Continuar con Facebook
          </button>
          
          <div className="text-center space-y-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/forgot')}
              className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
              Recuperar contraseña
            </button>
            <br />
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