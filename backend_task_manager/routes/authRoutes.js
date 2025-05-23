const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const authenticateUser = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
})
const upload = multer({ storage });

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/authCheck', authController.authCheck);
router.delete('/deleteAccount', authenticateUser, authController.deleteAccount);


module.exports = router;