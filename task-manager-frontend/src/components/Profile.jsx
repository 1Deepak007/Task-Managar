import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaUserCircle } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Formik and Yup imports
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Profile = () => {
    const [profile, setProfile] = useState(null); // Initialize as null
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [openModal, setOpenModal] = useState(false);
    const [selectedProfilePic, setSelectedProfilePic] = useState(null);
    const fileInputRef = useRef(null);

    const [changePassModal, setChangePassModal] = useState(false); // Renamed for clarity: changePassModel -> changePassModal

    const [changeProfilePic, setChangeProfilePic] = useState(null);

    const validationSchema = Yup.object({
        firstname: Yup.string()
            .min(2, 'First name must be at least 2 characters')
            .max(50, 'First name must be 50 characters or less')
            .required('First name is required'),
        lastname: Yup.string()
            .min(2, 'Last name must be at least 2 characters')
            .max(50, 'Last name must be 50 characters or less')
            .required('Last name is required'),
        email: Yup.string()
            .email('Invalid email address')
            .required('Email is required'),
    });

    const formik = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            email: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            setSubmitting(true);
            try {
                const response = await axios.patch(
                    'http://localhost:3289/api/profile/',
                    values,
                    {
                        withCredentials: true,
                    }
                );
                toast.success(response.data.message || 'Profile updated successfully!');

                // Optimistically update profile state after successful update
                setProfile(prevProfile => ({
                    ...prevProfile,
                    firstname: values.firstname,
                    lastname: values.lastname,
                    email: values.email
                }));

                setOpenModal(false); // Close the modal on success
            } catch (err) {
                console.error('Error updating profile:', err);
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(`Update Error: ${err.response.data.message}`);
                } else {
                    toast.error('An error occurred while updating the profile.');
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Formik for change password
    const passwordValidationSchema = Yup.object({
        currentPassword: Yup.string().required('Current password is required'),
        newPassword: Yup.string()
            .min(6, 'New password must be at least 6 characters')
            .required('New password is required'),
        confirmNewPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
            .required('Confirm new password is required'),
    });

    const passwordFormik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        },
        validationSchema: passwordValidationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setSubmitting(true);
            try {
                const response = await axios.put(
                    'http://localhost:3289/api/profile/', // Your API endpoint
                    {
                        currentPassword: values.currentPassword,
                        newPassword: values.newPassword,
                    },
                    {
                        withCredentials: true,
                    }
                );
                toast.success(response.data.message || 'Password updated successfully!');
                setChangePassModal(false); // Close the modal
                resetForm(); // Clear form fields
            } catch (err) {
                console.error('Error changing password:', err);
                if (err.response && err.response.data && err.response.data.message) {
                    toast.error(`Password Change Error: ${err.response.data.message}`);
                } else {
                    toast.error('An error occurred while changing the password.');
                }
            } finally {
                setSubmitting(false);
            }
        },
    });


    const getProfile = async () => {
        try {
            // Only set loading to true if profile is currently null (first load)
            // or if we explicitly want to show a loading indicator for a refresh
            if (!profile) {
                setLoading(true);
            }
            const response = await axios.get('http://localhost:3289/api/profile/', {
                withCredentials: true,
            });
            setProfile(response.data.user);
            if (response.data.user) {
                formik.setValues({
                    firstname: response.data.user.firstname || '',
                    lastname: response.data.user.lastname || '',
                    email: response.data.user.email || ''
                });
            }
            setLoading(false);
            setError(null);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile. Please try again.');
            setLoading(false);
            setProfile(null); // Ensure profile is null on error
        }
    };


    useEffect(() => {
        getProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <p className="text-xl font-medium">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <p className="text-red-500 text-xl font-medium">{error}</p>
            </div>
        );
    }

    // Crucial check: only render the main profile content if `profile` exists (is not null)
    // This handles cases where initial fetch fails or response is empty/invalid.
    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <p className="text-red-500 text-xl font-medium">No profile data available.</p>
            </div>
        );
    }

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedProfilePic(file);
        }
    };

    const handleUploadProfilePicture = async () => {
        if (!selectedProfilePic) {
            toast.error('Please select a profile picture to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('profile_image', selectedProfilePic);

        try {
            const response = await axios.post(
                'http://localhost:3289/api/profile/uploadProfilePicture',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true,
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        toast.info(`Uploading: ${percentCompleted}%`, {
                            toastId: 'upload-progress',
                            autoClose: false,
                            progress: percentCompleted / 100,
                        });
                    }
                }
            );

            toast.success(response.data.message || 'Profile picture uploaded successfully!');
            // --- CRITICAL CHANGE HERE: Directly update the profile state ---
            setProfile(prevProfile => ({
                ...prevProfile,
                profile_picture: response.data.profilePictureUrl
            }));
            setSelectedProfilePic(null);
            toast.dismiss('upload-progress');

        } catch (err) {
            console.error('Error uploading profile picture:', err);
            toast.dismiss('upload-progress');
            if (err.response && err.response.data && err.response.data.message) {
                toast.error(`Upload Error: ${err.response.data.message}`);
            } else {
                toast.error('An error occurred while uploading the profile picture.');
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const openEditModal = () => {
        setOpenModal(true);
        if (profile) {
            formik.setValues({
                firstname: profile.firstname || '',
                lastname: profile.lastname || '',
                email: profile.email || ''
            });
        }
        formik.setErrors({});
        formik.setTouched({});
    };

    const closeEditModal = () => {
        setOpenModal(false);
        formik.resetForm();
    };

    const openChangePassModal = () => {
        setChangePassModal(true);
        passwordFormik.resetForm(); // Clear password form fields on open
        passwordFormik.setErrors({});
        passwordFormik.setTouched({});
    };

    const closeChangePassModal = () => {
        setChangePassModal(false);
        passwordFormik.resetForm();
    };

    const handleDeleteAccount=()=>{
        axios.delete('http://localhost:3289/api/profile/deleteProfile')
        .then(response => {
            toast.success('Account deleted successfully!');
            navigate('/login');
            console.log(response.data);
        })
        .catch(error => {
            console.error('Error deleting account:', error);
            toast.error('Failed to delete account. Please try again.');
        });
    }

    return (
        <div className="max-w-4xl w-full mx-auto bg-white shadow-2xl rounded-2xl p-8 sm:p-10 lg:p-12 transform transition-all duration-300 ">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-8 mb-10">
                <div className="flex-shrink-0 relative group">
                    {profile && profile.profile_picture ? (
                        <img
                            src={profile.profile_picture}
                            alt="Profile"
                            className="w-24 h-24 sm:w-36 sm:h-36 rounded-full object-cover border-5 border-green-200 shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl"
                        />
                    ) : (
                        <button
                            onClick={triggerFileInput}
                            className="w-24 h-24 sm:w-36 sm:h-36 flex items-center justify-center bg-gray-200 text-gray-400 rounded-full border-4 border-gray-300 shadow-lg cursor-pointer transition-colors duration-300 hover:bg-gray-300 hover:text-gray-500 transform group-hover:scale-105"
                            type="button"
                        >
                            <FaUserCircle className="w-20 h-20 sm:w-35 sm:h-35" />
                        </button>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleProfilePicChange}
                        accept="image/*"
                        className="hidden"
                    />

                    {profile && !profile.profile_picture && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                                onClick={triggerFileInput}
                                className="text-white text-lg font-semibold tracking-wide"
                                type="button"
                            >
                                Upload Photo
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
                    <h2 className="text-5xl font-extrabold text-gray-900 mb-2 leading-tight">
                        {profile ? (profile.firstname + " " + profile.lastname) : 'Guest User'}
                    </h2>
                    <p className="text-xl text-gray-700 mb-2">{profile ? profile.email : 'No Email Provided'}</p>
                    <p className="text-md text-gray-500">
                        Joined:{' '}
                        <span className="font-medium">
                            {profile && profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                    </p>
                </div>

                <div className="flex-col sm:flex-row gap-4 sm:items-end mt-4 sm:mt-0">
                    <div className="flex-row">
                        <button
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold py-3 px-5 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
                            type="button"
                            onClick={openChangePassModal}
                        >
                            Update Password
                        </button>
                    </div>
                    <div className="flex-row mt-2">
                        <button
                            className="bg-yellow-500 hover:bg-red-400 text-white text-sm font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                            type="button"
                            onClick={triggerFileInput}
                        >
                            Update Pro. Pic.
                        </button>
                    </div>
                    <div className="flex-row mt-2">
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-3 px-6.5 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                            type="button"
                            onClick={handleDeleteAccount}
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-center">
                {selectedProfilePic && (
                    <p className="text-blue-600 mb-2">Selected file: <span className="font-semibold">{selectedProfilePic.name}</span></p>
                )}
                {selectedProfilePic && (
                    <button
                        onClick={handleUploadProfilePicture}
                        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out"
                        type="button"
                    >
                        Confirm Upload
                    </button>
                )}
            </div>

            <div className="flex justify-between items-center mb-6 mt-8">
                <h3 className="text-3xl font-bold text-gray-800 border-b-4 border-blue-400 pb-2">About Me</h3>
                <button
                    onClick={openEditModal}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                    type="button"
                >
                    <FaEdit className="text-xl" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-lg text-gray-700">
                <p className="flex items-center">
                    <span className="font-semibold text-gray-800 w-36">Username:</span>
                    <span className="ml-3 font-medium">{profile.username || 'Not Set'}</span>
                </p>
                <p className="flex items-center">
                    <span className="font-semibold text-gray-800 w-36">First Name:</span>
                    <span className="ml-3 font-medium">{profile.firstname || 'Not Set'}</span>
                </p>
                <p className="flex items-center">
                    <span className="font-semibold text-gray-800 w-36">Last Name:</span>
                    <span className="ml-3 font-medium">{profile.lastname || 'Not Set'}</span>
                </p>
                <p className="flex items-center">
                    <span className="font-semibold text-gray-800 w-36">Email:</span>
                    <span className="ml-3 font-medium">{profile.email || 'No Email Provided'}</span>
                </p>
                <p className="flex items-center">
                    <span className="font-semibold text-gray-800 w-36">Registered On:</span>
                    <span className="ml-3 font-medium">
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                </p>
            </div>

            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-lg mx-auto p-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                            <h3 className="text-2xl font-bold text-gray-800">Update Profile Information</h3>
                            <button
                                onClick={closeEditModal}
                                className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none focus:outline-none"
                                type="button"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="modal-body">
                            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your First Name
                                    </label>
                                    <input
                                        id="firstname"
                                        name="firstname"
                                        type="text"
                                        placeholder="John"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.firstname}
                                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${formik.touched.firstname && formik.errors.firstname
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-blue-400'
                                            }`}
                                    />
                                    {formik.touched.firstname && formik.errors.firstname ? (
                                        <p className="text-red-500 text-sm mt-1">{formik.errors.firstname}</p>
                                    ) : null}
                                </div>

                                <div>
                                    <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Last Name
                                    </label>
                                    <input
                                        id="lastname"
                                        name="lastname"
                                        type="text"
                                        placeholder="Doe"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.lastname}
                                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${formik.touched.lastname && formik.errors.lastname
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-blue-400'
                                            }`}
                                    />
                                    {formik.touched.lastname && formik.errors.lastname ? (
                                        <p className="text-red-500 text-sm mt-1">{formik.errors.lastname}</p>
                                    ) : null}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.email}
                                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${formik.touched.email && formik.errors.email
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-blue-400'
                                            }`}
                                    />
                                    {formik.touched.email && formik.errors.email ? (
                                        <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
                                    ) : null}
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={formik.isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {formik.isSubmitting ? 'Updating...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        disabled={formik.isSubmitting}
                                        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {changePassModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-lg mx-auto p-6">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                            <h3 className="text-2xl font-bold text-gray-800">Change Password</h3>
                            <button
                                onClick={closeChangePassModal}
                                className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none focus:outline-none"
                                type="button"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="modal-body">
                            <form onSubmit={passwordFormik.handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type="password"
                                        placeholder="Enter current password"
                                        onChange={passwordFormik.handleChange}
                                        onBlur={passwordFormik.handleBlur}
                                        value={passwordFormik.values.currentPassword}
                                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-blue-400'
                                            }`}
                                    />
                                    {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword ? (
                                        <p className="text-red-500 text-sm mt-1">{passwordFormik.errors.currentPassword}</p>
                                    ) : null}
                                </div>

                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        placeholder="Enter new password"
                                        onChange={passwordFormik.handleChange}
                                        onBlur={passwordFormik.handleBlur}
                                        value={passwordFormik.values.newPassword}
                                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${passwordFormik.touched.newPassword && passwordFormik.errors.newPassword
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-blue-400'
                                            }`}
                                    />
                                    {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword ? (
                                        <p className="text-red-500 text-sm mt-1">{passwordFormik.errors.newPassword}</p>
                                    ) : null}
                                </div>

                                <div>
                                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        id="confirmNewPassword"
                                        name="confirmNewPassword"
                                        type="password"
                                        placeholder="Confirm new password"
                                        onChange={passwordFormik.handleChange}
                                        onBlur={passwordFormik.handleBlur}
                                        value={passwordFormik.values.confirmNewPassword}
                                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${passwordFormik.touched.confirmNewPassword && passwordFormik.errors.confirmNewPassword
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-blue-400'
                                            }`}
                                    />
                                    {passwordFormik.touched.confirmNewPassword && passwordFormik.errors.confirmNewPassword ? (
                                        <p className="text-red-500 text-sm mt-1">{passwordFormik.errors.confirmNewPassword}</p>
                                    ) : null}
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={passwordFormik.isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {passwordFormik.isSubmitting ? 'Changing...' : 'Change Password'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeChangePassModal}
                                        disabled={passwordFormik.isSubmitting}
                                        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-5 rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;