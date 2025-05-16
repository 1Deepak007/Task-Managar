const conn = require('../config/db');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const mime = require('mime-types');
require('dotenv').config();

// get user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [user] = await conn.query(`SELECT id, username, firstname, lastname, email, profile_picture FROM users WHERE id = ${userId}`);
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        else {
            return res.status(200).json({
                message: 'User profile retrieved successfully',
                user: user[0]
            });
        }
    }
    catch (error) {
        console.error('Error retrieving user profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firstname, lastname, email, profilePicture } = req.body;

        const fields = [];
        const values = [];

        if (firstname) {
            fields.push('firstname = ?');
            values.push(firstname);
        }
        if (lastname) {
            fields.push('lastname = ?');
            values.push(lastname);
        }
        if (email) {
            // Check if email is already used by another user
            const [existingEmail] = await conn.query(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, userId]
            );
            if (existingEmail.length > 0) {
                return res.status(400).json({ message: 'Email already exists' });
            } else {
                fields.push('email = ?');
                values.push(email);
            }
        }
        if (profilePicture) {
            fields.push('profile_picture = ?');
            values.push(profilePicture);
        }

        // If no fields provided
        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Run update query
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        values.push(userId);
        await conn.query(sql, values);

        return res.status(200).json({ message: 'User profile updated successfully' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// profile picture upload
const uploadProfilePicture = async (req, res) => {
    try {
        // Check for file
        if (!req.file) {
            return res.status(400).json({ message: 'Profile image file is required' });
        }

        // Get user ID from the token or session.  This is CRUCIAL for security.
        const userId = req.user.id; //  <---  Important: Get from authenticated user!

        // Upload image to Cloudinary using the helper function
        const profilePicUrl = await uploadToCloudinary(req.file.path, 'profile_pictures');

        // Update user's profile_picture in the database
        const [result] = await conn.query(
            'UPDATE users SET profile_picture = ? WHERE id = ?',
            [profilePicUrl, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or update failed' }); //should not happen
        }

        return res.status(200).json({
            message: 'Profile picture uploaded successfully',
            profilePictureUrl: profilePicUrl
        });

    } catch (error) {
        // Handle errors from Cloudinary and database operations
        console.error('Profile picture upload error:', error);
        return res.status(500).json({ message: 'Failed to upload profile picture: ' + error.message });
    }
};

// Cloudinary config (moved out to avoid reconfiguring on every request)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function for uploading to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
    try {
        const fileData = fs.readFileSync(filePath, { encoding: 'base64' });
        const mimeType = mime.lookup(filePath); // e.g., image/png, image/jpeg
        const result = await cloudinary.uploader.upload(`data:${mimeType};base64,${fileData}`, {
            folder: folder,
            timeout: 60000,
            transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto', fetch_format: 'auto' }
            ]
        });
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        throw error;
    }
};

// update user's password
const updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        // Check if current password is correct
        const [user] = await conn.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update password in database
        await conn.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getUserProfile,
    updateProfile,
    updatePassword,
    uploadProfilePicture
}