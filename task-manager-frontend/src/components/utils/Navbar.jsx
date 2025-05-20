import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CgProfile } from "react-icons/cg";

const Navbar = () => {

    const navigate = useNavigate();
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

            // Force a complete refresh to clear all state and ensure auth is reset
            window.location.href = '/login';
            return; // Exit early since we're doing a full refresh

        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div>
            <div className='bg-black p-0 flex justify-between font-serif'>
                <span className='text-white text-3xl font-bold p-0 mt-3 ms-3'>
                    <CgProfile />
                </span>

                <h2 className='text-white text-2xl font-bold p-2'>Task Manager</h2>
                <div className='flex'>
                    <button
                        className='bg-red-500 text-white rounded-lg px-4 py-2 m-2'
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Navbar
