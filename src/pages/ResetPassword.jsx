import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ResetPage() {
  const { confirmThePasswordReset } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (!oobCode) {
      setError('El enlace de restablecimiento es inválido o ha expirado.');
    }
  }, [oobCode]);

  // Reglas de validación
  const hasMinLength   = password.length >= 10;
  const hasUppercase   = /[A-Z]/.test(password);
  const hasLowercase   = /[a-z]/.test(password);
  const hasNumber      = /[0-9]/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);

  const isValidPassword = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const isFormValid = isValidPassword && passwordsMatch && oobCode && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    setLoading(true);
    setError('');

    try {
      await confirmThePasswordReset(oobCode, password);
      alert('Contraseña actualizada correctamente. Ahora puedes iniciar sesión.');
      navigate('/');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/expired-action-code') {
        setError('El enlace ha expirado. Por favor, solicita uno nuevo.');
      } else if (error.code === 'auth/invalid-action-code') {
        setError('El enlace es inválido. Por favor, solicita uno nuevo.');
      } else {
        setError('Ocurrió un error al restablecer la contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">

        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold">Restablecer contraseña</h3>
          <p className="text-sm text-gray-500 text-center">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-xs rounded flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nueva contraseña */}
          <div>
            <label className="text-sm text-gray-600">Nueva contraseña</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={!oobCode || loading}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 pl-10 pr-10
                  ${password.length === 0
                    ? 'border-gray-300 focus:ring-blue-500'
                    : isValidPassword
                    ? 'border-green-400 focus:ring-green-500'
                    : 'border-red-400 focus:ring-red-500'
                  }`}
                placeholder="Nueva contraseña"
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

            {/* Reglas visuales */}
            {touched.password && (
              <div className="text-xs mt-2 space-y-1">
                <p className={hasMinLength   ? 'text-green-500' : 'text-red-500'}>
                  • Mínimo 10 caracteres
                </p>
                <p className={hasUppercase   ? 'text-green-500' : 'text-red-500'}>
                  • Al menos una mayúscula
                </p>
                <p className={hasLowercase   ? 'text-green-500' : 'text-red-500'}>
                  • Al menos una minúscula
                </p>
                <p className={hasNumber      ? 'text-green-500' : 'text-red-500'}>
                  • Al menos un número
                </p>
                <p className={hasSpecialChar ? 'text-green-500' : 'text-red-500'}>
                  • Un carácter especial (ej: !, @, #)
                </p>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="text-sm text-gray-600">Confirmar contraseña</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                disabled={!oobCode || loading}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 pl-10
                  ${confirmPassword.length === 0
                    ? 'border-gray-300 focus:ring-blue-500'
                    : passwordsMatch
                    ? 'border-green-400 focus:ring-green-500'
                    : 'border-red-400 focus:ring-red-500'
                  }`}
                placeholder="Confirmar contraseña"
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>

            {touched.confirmPassword && !passwordsMatch && confirmPassword.length > 0 && (
              <p className="text-xs text-red-500 mt-1">
                Las contraseñas no coinciden
              </p>
            )}

            {touched.confirmPassword && passwordsMatch && (
              <p className="text-xs text-green-500 mt-1">
                Coinciden ✔
              </p>
            )}
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 rounded text-white transition
              ${isFormValid
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPage;