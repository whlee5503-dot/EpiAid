import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import DosageCalc from './pages/DosageCalc'
import NutritionAssess from './pages/NutritionAssess'
import DiagnosticCheck from './pages/DiagnosticCheck'
import PhraseCard from './pages/PhraseCard'
import PatientLog from './pages/PatientLog'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dosage" element={<DosageCalc />} />
          <Route path="/nutrition" element={<NutritionAssess />} />
          <Route path="/diagnose" element={<DiagnosticCheck />} />
          <Route path="/phrases" element={<PhraseCard />} />
          <Route path="/patients" element={<PatientLog />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
