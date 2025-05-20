import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = ({ onAuthChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post(
        'http://localhost:3289/api/auth/login',
        { email, password },
        { withCredentials: true } // Send cookies
      );
      toast.success('Login successful!');
      onAuthChange();   
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials.');
      toast.error('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg text-black w-1/3">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-2 border-gray-300 rounded-md p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-2 border-gray-300 rounded-md p-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-blue-500 hover:text-white w-full text-center ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <span className="block mt-4">
          Don't Have an Account? <Link to="/signup" className="text-blue-600 hover:text-xl hover:text-blue-700">Signup</Link>
        </span>
      </form>
    </div>
  );
};

export default Login;