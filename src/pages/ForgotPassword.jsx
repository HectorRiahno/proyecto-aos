import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ForgotPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);


  const isValidEmail = /\S+@\S+\.\S+/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isValidEmail) return;

    alert(`Se enviaron instrucciones a: ${email}`);
    navigate('/reset');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold">Recuperar contraseña</h3>
          <p className="text-sm text-gray-500 text-center">
            Ingresa tu correo registrado
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Correo */}
          <div>
            <label className="text-sm text-gray-600">
              Correo electrónico
            </label>

            <div className="mt-1 relative">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 pl-10
                  ${email.length === 0
                    ? 'border-gray-300 focus:ring-blue-500'
                    : isValidEmail
                    ? 'border-green-400 focus:ring-green-500'
                    : 'border-red-400 focus:ring-red-500'
                  }`}
                placeholder="correo@ejemplo.com"
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>

            {touched && !isValidEmail && email.length > 0 && (
              <p className="text-xs text-red-500 mt-1">
                Ingresa un correo válido para continuar
              </p>
            )}

            {touched && isValidEmail && (
              <p className="text-xs text-green-500 mt-1">
                Correo válido ✔
              </p>
            )}
          </div>

         
          <button
            type="submit"
            onClick={() => navigate('/reset')}
            disabled={!isValidEmail}
            className={`w-full py-2 rounded text-white transition
              ${isValidEmail
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            Enviar instrucciones
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            <ArrowLeft size={16} /> Volver al login
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPage;