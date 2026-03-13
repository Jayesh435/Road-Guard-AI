/**
 * RoadGuard AI – Root Application Component
 * Sets up React Router and wraps the app in context providers.
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import DashboardPage from './pages/DashboardPage';
import ReportPage from './pages/ReportPage';
import Navbar from './components/UI/Navbar';

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-slate-900 text-slate-100">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/report" element={<ReportPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
