import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
const Signup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    firstname: Yup.string().required('First name is required'),
    lastname: Yup.string(),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setFieldError, resetForm }) => {
      setIsSubmitting(true);

      try {
        const response = await axios.post(
          'http://localhost:3289/api/auth/signup',
          {
            username: values.username,
            firstname: values.firstname,
            lastname: values.lastname,
            email: values.email,
            password: values.password
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );

        alert(response.data.message || 'Account created successfully!');
        console.log('Signup successful:', response.data);
        resetForm();
      } catch (error) {
        console.error('Signup error:', error);

        if (error.response) {
          setFieldError('general', error.response.data.message || 'Signup failed');
          alert(error.response.data.message || 'Signup failed');
        } else {
          setFieldError('general', 'Network error. Please try again.');
          alert('Network error. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }

  });


  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-800'>
      <div className='bg-white shadow-md rounded-lg p-6 w-90'>
        <h1 className='text-center underline text-2xl font-bold font-sans mb-5'>Signup</h1>
        <form className='flex flex-col items-center justify-center mt-4' onSubmit={formik.handleSubmit}>
          <input
            className={`border ${formik.touched.firstname && formik.errors.firstname ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 mb-2 w-80`}
            type="text"
            placeholder='Firstname'
            name='firstname'
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.firstname}
          />
          {formik.touched.firstname && formik.errors.firstname && (
            <p className="text-red-500 text-xs italic mb-2">{formik.errors.firstname}</p>
          )}

          <input
            className='border border-gray-300 rounded-md p-2 mb-2 w-80'
            type="text"
            placeholder='Lastname'
            name='lastname'
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.lastname}
          />

          <input
            className={`border ${formik.touched.username && formik.errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 mb-2 w-80`}
            type="text"
            placeholder='Username'
            name='username'
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.username}
          />
          {formik.touched.username && formik.errors.username && (
            <p className="text-red-500 text-xs italic mb-2">{formik.errors.username}</p>
          )}

          <input
            className={`border ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 mb-2 w-80`}
            type="email"
            placeholder='Email'
            name='email'
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-red-500 text-xs italic mb-2">{formik.errors.email}</p>
          )}

          <input
            className={`border ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 mb-2 w-80`}
            type="password"
            placeholder='Password'
            name='password'
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-xs italic mb-2">{formik.errors.password}</p>
          )}

          <input
            className={`border ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 mb-2 w-80`}
            type="password"
            placeholder='Confirm Password'
            name='confirmPassword'
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-red-500 text-xs italic mb-2">{formik.errors.confirmPassword}</p>
          )}

          <button
            className='bg-blue-500 text-white rounded-md p-2 w-80 hover:bg-blue-600 transition duration-200 mt-4'
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Signup'}
          </button>
          {formik.errors.general && (
            <p className="text-red-500 text-sm italic mt-2">{formik.errors.general}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signup;
