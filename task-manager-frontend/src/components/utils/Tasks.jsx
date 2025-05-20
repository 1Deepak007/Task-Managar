import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contextapi/AuthContext';
import AddUpdateTask from './AddUpdateTask';

const Tasks = () => {
  const { user } = useAuth(); // No need for token
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggleAddUpdateTask, setToggleAddUpdateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
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
        if (err.response) {
          setError(`Failed to load tasks: ${err.response.data.message || 'Server error'}`);
        } else if (err.request) {
          setError('Failed to load tasks: No response from server. Check network connection.');
        } else {
          setError('Failed to load tasks: An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setToggleAddUpdateTask(true);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setToggleAddUpdateTask(true);
  };

  const refreshTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3289/api/tasks/', {
        withCredentials: true, // Send cookies
      });
      setTasks(response.data);
    } catch (err) {
      setError('Failed to refresh tasks.');
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
          <button
            onClick={handleAddTask}
            className="border-2 border-black rounded-md ps-2 pe-2 bg-green-400 font-medium hover:bg-green-500"
          >
            Add Task
          </button>
        </span>
        {tasks.length === 0 ? (
          <p className="text-gray-600">No tasks found for {user?.email}.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{task.title}</h3>
                <p className="text-gray-700 mb-2">{task.description}</p>
                <p className="text-sm text-gray-500">
                  Status:{' '}
                  <span
                    className={`font-medium ${
                      task.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}
                  >
                    {task.status}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(task.created_at).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleEditTask(task)}
                  className="mt-2 border-2 border-black rounded-md ps-2 pe-2 bg-blue-400 font-medium hover:bg-blue-500"
                >
                  Edit Task
                </button>
              </div>
            ))}
          </div>
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