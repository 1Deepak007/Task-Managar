const conn = require('../config/db'); 

const createTask = async (req, res) => {
    const { title, description, status = 'pending' } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const [result] = await conn.query(
            'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)',
            [req.user.id, title, description, status]
        );
        
        const [newTask] = await conn.query(
            'SELECT id, title, description, status, created_at FROM tasks WHERE id = ?',
            [result.insertId]
        );
        
        res.status(201).json(newTask[0]);
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getAllTasks = async (req, res) => {
    try {
        const [tasks] = await conn.query(
            'SELECT id, title, description, status, created_at FROM tasks WHERE user_id = ?',
            [req.user.id]
        );
        res.status(200).json(tasks);
    } catch (err) {
        console.error('Error getting tasks:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;
        
        const [results] = await conn.query(
            'SELECT id, title, description, status, created_at FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, userId]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(results[0]);
    } catch (err) {
        console.error('Error getting task:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;
        const { title, description, status } = req.body;

        // Validate status if provided
        if (status && !['pending', 'working', 'completed'].includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status value',
                validStatuses: ['pending', 'working', 'completed']
            });
        }

        // Check if at least one field is provided
        if (!title && !description && !status) {
            return res.status(400).json({ 
                message: 'No fields to update',
                requiredFields: {
                    title: 'string (optional)',
                    description: 'string (optional)',
                    status: 'pending|working|completed (optional)'
                }
            });
        }

        // Build the update query dynamically
        const updates = [];
        const values = [];

        if (title !== undefined) {
            updates.push('title = ?');
            values.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (status !== undefined) {
            updates.push('status = ?');
            values.push(status);
        }

        // Add WHERE conditions
        values.push(taskId, userId);

        const query = `
            UPDATE tasks 
            SET ${updates.join(', ')} 
            WHERE id = ? AND user_id = ?
        `;

        // Execute the update
        const [result] = await conn.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                message: 'Task not found or not owned by user'
            });
        }

        // Fetch and return the updated task
        const [updatedTask] = await conn.query(
            'SELECT id, title, description, status, created_at FROM tasks WHERE id = ?',
            [taskId]
        );

        res.status(200).json(updatedTask[0]);

    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ 
            message: 'Failed to update task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


const deleteTask = async(req, res) => {
    try{
        const taskId = req.params.id;
        const userId = req.user.id;
        
        const [result] = await conn.query(
                'DELETE FROM tasks WHERE id = ? AND user_id = ?',
                [taskId, userId]
            );
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    message: 'Task not found or not owned by user'
                });
            }
            return res.status(200).json({ 
                message: 'Task deleted successfully'
            });
    } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).json({ 
            message: 'Failed to delete task',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
};