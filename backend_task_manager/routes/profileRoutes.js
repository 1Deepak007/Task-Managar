const {getUserProfile, updateProfile, updatePassword, uploadProfilePicture } = require('../controllers/profileController');

const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(authenticateUser);

router.get('/', getUserProfile);
router.patch('/', updateProfile);
router.put('/',updatePassword);
router.post('/uploadProfilePicture',upload.single('profile_image'),uploadProfilePicture)

module.exports = router;