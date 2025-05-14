// routes/tasks.js
const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/authMiddleware');
const { getAllTasks, createTask, updateTask, deleteTask, getTaskById } = require('../controllers/tasksController')
// All routes require JWT authentication
router.use(authenticateUser);

router.get('/', authenticateUser, getAllTasks)        // http://localhost:3289/api/tasks/
router.post('/', authenticateUser, createTask)        // http://localhost:3289/api/tasks/           { "title": "Coding", "description": "Do coding practice", "status": "pending" }
router.put('/:id', authenticateUser, updateTask);     // http://localhost:3289/api/tasks/1          { "title": "Coding", "description": "Do coding practice", "status": "pending" }
router.get('/:id', authenticateUser, getTaskById);    // http://localhost:3289/api/tasks/3
router.delete('/:id', authenticateUser, deleteTask);  // http://localhost:3289/api/tasks/5          

module.exports = router;
