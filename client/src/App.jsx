import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import EmployeesPage from './pages/EmployeesPage';
import InsightsPage from './pages/InsightsPage';
import { ToastProvider } from './components/ui/toast';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/employees" replace />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/insights" element={<InsightsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
}

export default App;
