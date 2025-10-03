import './App.css'
import Home from './components/Home'
import SignUp_Login from './components/SignUp_Login'
import Dashboard from './components/Dashboard'
import Dashboard_Home from './components/Dashboard_components/Dashboard_Home.jsx'
import Dashboard_Transaction from './components/Dashboard_components/Dashboard_Transaction.jsx'
import Dashboard_Reports from './components/Dashboard_components/Dashboard_Reports.jsx'
import Dashboard_Budgets from './components/Dashboard_components/Dashboard_Budgets.jsx'
import Dashboard_Setting from './components/Dashboard_components/Dashboard_Setting.jsx'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937', // dark background
            color: '#f9fafb',      // light text
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Signup_Login" element={<SignUp_Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Dashboard_Home />} />
          <Route path="transactions" element={<Dashboard_Transaction />} />
          <Route path="reports" element={<Dashboard_Reports />} />
          <Route path="budgets" element={<Dashboard_Budgets />} />
          <Route path="settings" element={<Dashboard_Setting />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
