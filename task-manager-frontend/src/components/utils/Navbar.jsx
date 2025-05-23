import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import axios from 'axios';
import { CgProfile } from "react-icons/cg";

const Navbar = () => {
    const location = useLocation(); // Initialize useLocation to get the current path
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await axios.post(
                'http://localhost:3289/api/auth/logout',
                {},
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <nav className="bg-gradient-to-r from-gray-900 to-black shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Section: Logo and Links */}
                    <div className="flex items-center space-x-6">
                        <Link to="/home" className="flex items-center">
                            <h2 className="text-white text-2xl font-bold tracking-tight">Task Manager</h2>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/home"
                                className={`
                                    hover:text-green-300 hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                                    ${location.pathname === '/home' ? 'text-green-300' : 'text-gray-300'}
                                `}
                            >
                                Tasks
                            </Link>
                        </div>
                    </div>

                    {/* Right Section: Profile Icon and Logout */}
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/profile"
                            className={`
                                flex items-center text-gray-300 hover:text-white
                                ${location.pathname === '/profile' ? 'text-green-300' : 'text-gray-300'}
                            `}
                        >
                            <CgProfile className="h-6 w-6 hover:size-7 hover:text-green-400" />
                        </Link>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={`bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200 ${
                                isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;