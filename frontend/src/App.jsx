import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AddEmployee from './pages/AddEmployee'
import Dashboard from './pages/Dashboard'
import EditEmployee from './pages/EditEmployee'
import EmployeeDetails from './pages/EmployeeDetails'
import EmployeeList from './pages/EmployeeList'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/employees/:id" element={<EmployeeDetails />} />

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/employees/new" element={<AddEmployee />} />
            <Route path="/employees/:id/edit" element={<EditEmployee />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
