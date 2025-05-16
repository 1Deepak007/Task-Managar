const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const conn = require('./config/db');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/tasksRoutes');
const profileRoutes = require('./routes/profileRoutes');


const app = express();

const PORT = process.env.PORT || 3289;

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Connect to the database
if(conn){
    console.log('Database connected');
}
else{
    console.error('Database not connected');
}

app.get('/', (req, res) => {
    res.send('Task manager backend is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/profile', profileRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});