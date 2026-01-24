import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import GoogleAuthCallback from './pages/auth/GoogleAuthCallback';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
        <Route path="/auth/success" element={<GoogleAuthCallback />} />
        <Route path="/dashboard" element={<div className="p-10 text-center"><h1 className="text-2xl">Dashboard (Phase 2)</h1></div>} />
      </Routes>
    </div>
  );
}

export default App;

