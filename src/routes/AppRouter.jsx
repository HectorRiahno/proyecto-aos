import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Auth Pages
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ForgotPage from '../pages/ForgotPassword'
import ResetPage from '../pages/ResetPassword'

//Home
import Home from '../pages/Home'

// Sesiones
import SessionsPage from '../pages/SessionsPage'

// Usuarios
import UsersPage from '../pages/UsersPage'

// Pacientes
import PatientsPage from '../pages/PatientsPage'

// Doctores
import DoctorsPage from '../pages/DoctorsPage'

// Citas
import AppointmentsPage from '../pages/AppointmentsPage'

// Perfil
import ProfilePage from '../pages/ProfilePage'

// Playground Home
import HomeHooks from '../playground/HomeHooks'

// Hooks Practice
import UseStatePractice from '../playground/UseStatePractice'
import UseDebugValuePractice from '../playground/UseDebugValuePractice'
import UseReducerPractice from '../playground/UseReducerPractice'
import UseRefPractice from '../playground/UseRefPractice'
import UseImperativeHandlePractice from '../playground/UseImperativeHandlePractice'
import UseMemoPractice from '../playground/UseMemoPractice'
import UseCallbackPractice from '../playground/UseCallbackPractice'
import UseTransitionPractice from '../playground/UseTransitionPractice'
import UseDeferredValuePractice from '../playground/UseDeferredValuePractice'
import UseEffectPractice from '../playground/UseEffectPractice'
import UseLayoutEffectPractice from '../playground/UseLayoutEffectPractice'
import UseInsertionEffectPractice from '../playground/UseInsertionEffectPractice'
import UseContextPractice from '../playground/UseContextPractice'
import UseSyncExternalStore from '../playground/UseSyncExternalStore'
import UseId from '../playground/UseId'
import Use from '../playground/Use'
import UseOptimistic from '../playground/UseOptimistic'
import UseActionState from '../playground/UseActionState'
import UseFormStatus from '../playground/UseFormStatus'

// Componente para proteger rutas privadas y de administrador
function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <h1 className="text-xl font-semibold text-slate-600">Cargando...</h1>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/Home" replace />;
  }

  return children;
}

// Componente para evitar que usuarios autenticados entren a Login/Register
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <h1 className="text-xl font-semibold text-slate-600">Cargando...</h1>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/Home" replace />;
  }

  return children;
}

function AppRouter() {
  return (
    <Routes>

      {/* auth (Rutas Públicas) */}
      <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot" element={<PublicRoute><ForgotPage /></PublicRoute>} />
      <Route path="/reset" element={<PublicRoute><ResetPage /></PublicRoute>} />

      {/* Home (Privada) */}
      <Route path="/Home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

      {/* sesiones (Privada - Solo Admin) */}
      <Route path="/sessions" element={<ProtectedRoute requireAdmin={true}><SessionsPage /></ProtectedRoute>} />

      {/* usuarios (Privada - Solo Admin) */}
      <Route path="/users" element={<ProtectedRoute requireAdmin={true}><UsersPage /></ProtectedRoute>} />

      {/* pacientes (Privada) */}
      <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />

      {/* doctores (Privada) */}
      <Route path="/doctors" element={<ProtectedRoute><DoctorsPage /></ProtectedRoute>} />

      {/* citas (Privada) */}
      <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />

      {/* perfil (Privada) */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Playground (Privada) */}
      <Route path="/playground" element={<ProtectedRoute><HomeHooks /></ProtectedRoute>} />

      <Route path="/playground/useState" element={<ProtectedRoute><UseStatePractice /></ProtectedRoute>} />
      <Route path="/playground/useDebugValue" element={<ProtectedRoute><UseDebugValuePractice /></ProtectedRoute>} />
      <Route path="/playground/useReducer" element={<ProtectedRoute><UseReducerPractice /></ProtectedRoute>} />
      <Route path="/playground/useRef" element={<ProtectedRoute><UseRefPractice /></ProtectedRoute>} />
      <Route path="/playground/useImperativeHandle" element={<ProtectedRoute><UseImperativeHandlePractice /></ProtectedRoute>} />
      <Route path="/playground/useMemo" element={<ProtectedRoute><UseMemoPractice /></ProtectedRoute>} />
      <Route path="/playground/useCallback" element={<ProtectedRoute><UseCallbackPractice /></ProtectedRoute>} />
      <Route path="/playground/useTransition" element={<ProtectedRoute><UseTransitionPractice /></ProtectedRoute>} />
      <Route path="/playground/useDeferredValue" element={<ProtectedRoute><UseDeferredValuePractice /></ProtectedRoute>} />
      <Route path="/playground/useEffect" element={<ProtectedRoute><UseEffectPractice /></ProtectedRoute>} />
      <Route path="/playground/useLayoutEffect" element={<ProtectedRoute><UseLayoutEffectPractice /></ProtectedRoute>} />
      <Route path="/playground/useInsertionEffect" element={<ProtectedRoute><UseInsertionEffectPractice /></ProtectedRoute>} />
      <Route path="/playground/useContext" element={<ProtectedRoute><UseContextPractice /></ProtectedRoute>} />
      <Route path="/playground/useSyncExternalStore" element={<ProtectedRoute><UseSyncExternalStore /></ProtectedRoute>} />
      <Route path="/playground/useId" element={<ProtectedRoute><UseId /></ProtectedRoute>} />
      <Route path="/playground/use" element={<ProtectedRoute><Use /></ProtectedRoute>} />
      <Route path="/playground/useOptimistic" element={<ProtectedRoute><UseOptimistic /></ProtectedRoute>} />
      <Route path="/playground/useActionState" element={<ProtectedRoute><UseActionState /></ProtectedRoute>} />
      <Route path="/playground/useFormStatus" element={<ProtectedRoute><UseFormStatus /></ProtectedRoute>} />

      
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  )
}

export default AppRouter