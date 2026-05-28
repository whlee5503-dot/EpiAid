import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DarkModeProvider } from './context/DarkModeContext'
import Layout from './components/layout/Layout'

// Lazy-load every page so only the current route's chunk is fetched on first visit.
// Layout and shared context stay eager — they're the always-visible shell.
const Home           = lazy(() => import('./pages/Home'))
const DosageCalc     = lazy(() => import('./pages/DosageCalc'))
const NutritionAssess= lazy(() => import('./pages/NutritionAssess'))
const DiagnosticCheck= lazy(() => import('./pages/DiagnosticCheck'))
const PhraseCard     = lazy(() => import('./pages/PhraseCard'))
const PatientLog     = lazy(() => import('./pages/PatientLog'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: '60svh' }}>
      <div
        className="w-8 h-8 rounded-full border-[3px] animate-spin"
        style={{ borderColor: 'var(--brand-bg)', borderTopColor: 'var(--brand)' }}
      />
    </div>
  )
}

export default function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/"        element={<Suspense fallback={<PageLoader />}><Home            /></Suspense>} />
            <Route path="/dosage"  element={<Suspense fallback={<PageLoader />}><DosageCalc      /></Suspense>} />
            <Route path="/nutrition" element={<Suspense fallback={<PageLoader />}><NutritionAssess /></Suspense>} />
            <Route path="/diagnose"  element={<Suspense fallback={<PageLoader />}><DiagnosticCheck /></Suspense>} />
            <Route path="/phrases"   element={<Suspense fallback={<PageLoader />}><PhraseCard      /></Suspense>} />
            <Route path="/patients"  element={<Suspense fallback={<PageLoader />}><PatientLog      /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DarkModeProvider>
  )
}
