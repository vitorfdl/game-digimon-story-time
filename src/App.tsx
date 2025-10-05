import { Routes, Route } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import DigimonOverviewPage from '@/pages/DigimonOverviewPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DigimonOverviewPage />} />
        <Route path="digimon/:slug" element={<DigimonOverviewPage />} />
      </Route>
    </Routes>
  )
}

export default App
