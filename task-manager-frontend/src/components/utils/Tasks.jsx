import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contextapi/AuthContext';
import AddUpdateTask from './AddUpdateTask';
import { BiAddToQueue, BiEdit,BiTrash } from "react-icons/bi";
import { RiPlayListAddLine } from "react-icons/ri";

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggleAddUpdateTask, setToggleAddUpdateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    if (!user) {
      setLoading(false);
      setError('Authentication information not fully loaded. Please refresh or try again.');
      return;
    }

    try {
      const response = await axios.get('http://localhost:3289/api/tasks/', {
        withCredentials: true, // Send cookies
      });
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Failed to load tasks: An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setToggleAddUpdateTask(true);
  };

  const handleDeleteTask = async (task) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`http://localhost:3289/api/tasks/${task.id}`, {
        withCredentials: true,
      });
      refreshTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setToggleAddUpdateTask(true);
  };

  const refreshTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3289/api/tasks/', {
        withCredentials: true, // Send cookies
      });
      setTasks(response.data);
    } catch (err) {
      console.error('Error refreshing tasks:', err);
      setError('Failed to refresh tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  }

  return (
    <>
      <div className="container mx-auto p-4">
        <span className="flex justify-between">
          <h2 className="text-2xl font-bold mb-0">Your Tasks</h2>
          <button
            onClick={handleAddTask}
            className="border-2 border-black rounded-md ps-2 pe-2 bg-green-400 font-medium hover:bg-green-500"
          >
            <RiPlayListAddLine />
          </button>
        </span>
        {tasks.length === 0 ? (
          <p className="text-gray-600">No tasks found for {user?.email}.</p>
        ) : (
          <table className="w-full table-auto border-1 mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border-1">Title</th>
                <th className="px-4 py-2 border-1">Description</th>
                <th className="px-4 py-2 border-1">Status</th>
                <th className="px-4 py-2 border-1">Created</th>
                <th className="px-4 py-2 border-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-100 border-1">
                  <td className="px-4 py-2 border-1">{task.title}</td>
                  <td className="px-4 py-2 border-1">{task.description}</td>
                  <td className="px-4 py-2 border-1">
                    <span
                      className={`font-medium ${
                        task.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-1">{new Date(task.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 flex items-center space-x-2">
                    <button
                      onClick={() => handleEditTask(task)}
                      className="flex items-center text-2xl text-green-600 ms-2"
                    >
                      <BiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="flex items-center text-2xl text-red-600"
                    >
                      <BiTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {toggleAddUpdateTask && (
        <AddUpdateTask
          setToggleAddUpdateTask={setToggleAddUpdateTask}
          task={selectedTask}
          refreshTasks={refreshTasks}
        />
      )}
    </>
  );
};

export default Tasks;