const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const conn = require('../config/db');




const signup = async (req, res) => {
    try {
        // Validate presence of required body data.  File is handled in separate endpoint
        const { email, password, username, firstname, lastname } = req.body;
        console.log('Signup attempt with data:', req.body);

        if (!email) return res.status(400).json({ message: 'Email is required' });
        if (!password) return res.status(400).json({ message: 'Password is required' });
        if (!username) return res.status(400).json({ message: 'Username is required' });
        if (!firstname) return res.status(400).json({ message: 'First name is required' });

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if email exists
        const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user (without profile picture)
        const [result] = await conn.query(
            'INSERT INTO users (username, firstname, lastname, email, password, profile_picture) VALUES (?, ?, ?, ?, ?, ?)',
            [username, firstname, lastname || null, email, hashedPassword, null] // profile_picture is initially null
        );

        // Create token
        const token = jwt.sign(
            { id: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 3600000 // 1 hour
        });

        return res.status(201).json({
            message: 'User created successfully.  Profile picture can be uploaded later.',
            user: { id: result.insertId, email }
        });

    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



/**
 * Handles user login.
 * -   Validates the email and password.
 * -   Authenticates the user against the database.
 * -   Issues a JWT and sets it as an HTTP-only cookie.
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    // console.log('Login attempt for:', email); 

    // Input validation
    if (!email || !password) {
        return res.status(400).json({ 
            message: 'Both email and password are required',
            fields: {
                email: !email ? 'Email is required' : null,
                password: !password ? 'Password is required' : null
            }
        });
    }

    // Improved email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            message: 'Invalid email format',
            example: 'user@example.com'
        });
    }

    try {
        // Retrieve user from database
        const [users] = await conn.query(
            'SELECT * FROM users WHERE email = ?', 
            [email]
        );

        if (users.length === 0) {
            console.warn('Login attempt with non-existent email:', email);
            return res.status(401).json({ 
                message: 'Invalid credentials' // Generic message for security
            });
        }

        const user = users[0];
        
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn('Failed login attempt for:', email);
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // Set cookie with better security options
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000, // 1 hour
            path: '/'
        });

        // Return user info (excluding sensitive data)
        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            message: 'An error occurred during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Handles user logout.  Clears the JWT cookie.
 */
const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', //  Clear in production
        sameSite: 'Strict',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};


module.exports = {
    signup,
    login,
    logout
};