const { Router } = require('express');
const { 
    getSettings,
    updateProfile,
    updatePassword,
    updateTheme,
    updateDarkMode,
    updateNotification,
    updatePrivacy
} = require('../controllers/settings');

const upload = require('../service/multer');

const router = Router();

router.get('/', getSettings);
router.post('/update-profile',upload.single('avatar'), updateProfile);
router.post('/update-password',updatePassword);

module.exports = router;