import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CreateElectionPage from './pages/CreateElectionPage'
import ElectionDetailPage from './pages/ElectionDetailPage'
import ResultsPage from './pages/ResultsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="create" element={<CreateElectionPage />} />
        <Route path="election/:id" element={<ElectionDetailPage />} />
        <Route path="election/:id/results" element={<ResultsPage />} />
      </Route>
    </Routes>
  )
}

export default App
