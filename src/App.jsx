import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import RecipeDetail from './pages/RecipeDetail'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
    </Routes>
  )
}

export default App