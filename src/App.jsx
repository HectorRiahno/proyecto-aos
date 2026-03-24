import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'

import HomeHooks from './playground/HomeHooks'

import UseStatePractice from './playground/UseStatePractice'
import UseDebugValuePractice from './playground/UseDebugValuePractice'
import UseReducerPractice from './playground/UseReducerPractice'
import UseRefPractice from './playground/UseRefPractice'
import UseImperativeHandlePractice from './playground/UseImperativeHandlePractice'
import UseMemoPractice from './playground/UseMemoPractice'
import UseCallbackPractice from './playground/UseCallbackPractice'

import UseTransitionPractice from './playground/UseTransitionPractice'
import UseDeferredValuePractice from './playground/UseDeferredValuePractice'
import UseEffectPractice from './playground/UseEffectPractice'
import UseLayoutEffectPractice from './playground/UseLayoutEffectPractice'
import UseInsertionEffectPractice from './playground/UseInsertionEffectPractice'
import UseContextPractice from './playground/UseContextPractice'

import UseSyncExternalStore from './playground/UseSyncExternalStore'
import UseId from './playground/UseId'
import Use from './playground/Use'
import UseOptimistic from './playground/UseOptimistic'
import UseActionState from './playground/UseActionState'
import UseFormStatus from './playground/UseFormStatus'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LoginPage />} />

        <Route path="/playground" element={<HomeHooks />} />

        <Route path="/playground/useState" element={<UseStatePractice />} />
        <Route path="/playground/useDebugValue" element={<UseDebugValuePractice />} />
        <Route path="/playground/useReducer" element={<UseReducerPractice />} />
        <Route path="/playground/useRef" element={<UseRefPractice />} />
        <Route path="/playground/useImperativeHandle" element={<UseImperativeHandlePractice />} />
        <Route path="/playground/useMemo" element={<UseMemoPractice />} />
        <Route path="/playground/useCallback" element={<UseCallbackPractice />} />

        <Route path="/playground/useTransition" element={<UseTransitionPractice />} />
        <Route path="/playground/useDeferredValue" element={<UseDeferredValuePractice />} />
        <Route path="/playground/useEffect" element={<UseEffectPractice />} />
        <Route path="/playground/useLayoutEffect" element={<UseLayoutEffectPractice />} />
        <Route path="/playground/useInsertionEffect" element={<UseInsertionEffectPractice />} />
        <Route path="/playground/useContext" element={<UseContextPractice />} />

        <Route path="/playground/useSyncExternalStore" element={<UseSyncExternalStore />} />
        <Route path="/playground/useId" element={<UseId />} />
        <Route path="/playground/use" element={<Use />} />
        <Route path="/playground/useOptimistic" element={<UseOptimistic />} />
        <Route path="/playground/useActionState" element={<UseActionState />} />
        <Route path="/playground/useFormStatus" element={<UseFormStatus />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App