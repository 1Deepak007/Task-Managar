import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contextapi/AuthContext';

const AddUpdateTask = ({ setToggleAddUpdateTask, task, refreshTasks }) => {
  const { user } = useAuth(); // No need for token prop

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (task) {
        // Update task
        await axios.put(`http://localhost:3289/api/tasks/${task.id}`, formData, {
          withCredentials: true, // Send cookies
        });
      } else {
        // Add task
        await axios.post('http://localhost:3289/api/tasks/', formData, {
          withCredentials: true, // Send cookies
        });
      }
      await refreshTasks();
      setToggleAddUpdateTask(false);
    } catch (err) {
      console.error('Error submitting task:', err);
      if (err.response?.status === 401) {
        setError('Unauthorized: Please log in again.');
      } else {
        setError('Failed to save task. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setToggleAddUpdateTask(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-sm text-white"
      onClick={handleClose}
    >
      <div
        className="bg-white w-1/4 rounded-lg shadow-lg p-6 text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800 underline">
            {task ? 'Update Task' : 'Add Task'}
          </h2>
          <button
            onClick={handleClose}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
          >
            X
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label htmlFor="title" className="text-gray-700">
              Task title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="border-2 border-gray-300 rounded-md p-2 w-full"
              placeholder="Enter task title"
              required
              aria-label="Task title"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label htmlFor="description" className="text-gray-700">
              Task description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="border-2 border-gray-300 rounded-md p-2 w-full"
              placeholder="Enter task description"
              required
              aria-label="Task description"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label htmlFor="status" className="text-gray-700">
              Task status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border-2 border-gray-300 rounded-md p-2 w-full"
              aria-label="Task status"
            >
              <option value="pending">Pending</option>
              <option value="working">Working</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Saving...' : task ? 'Update Task' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateTask;