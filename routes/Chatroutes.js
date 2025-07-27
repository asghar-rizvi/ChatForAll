const express = require('express');
const router = express.Router();
const { showChatUI, handleUserChatDisplay } = require('../controllers/Chat');

router.get('/', showChatUI);
router.get('/:friendId', handleUserChatDisplay);


module.exports = router;