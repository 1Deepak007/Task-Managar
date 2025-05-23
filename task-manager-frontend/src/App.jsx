// app.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from 'react-hot-toast';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import { useAuth } from './components/contextapi/AuthContext';
import Navbar from './components/utils/Navbar';

function App() {
  const { isAuthenticated, user, authCheckCompleted, handleAuthChange } = useAuth();

  if (!authCheckCompleted) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
      {
        isAuthenticated ?
        <Navbar /> : null
      }
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#333', color: '#fff' },
          }}
        />
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/home" replace /> : <Login onAuthChange={handleAuthChange} />}
          />
          <Route
            path="/signup"
            element={
              !isAuthenticated ? <Signup onAuthChange={handleAuthChange} /> : <Navigate to="/home" replace />
            }
          />
          <Route
            path="/home"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/home" replace /> : <Login onAuthChange={handleAuthChange} />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;