const express = require('express');
const router = express.Router();
const networkController = require('../controllers/Network');
const User = require('../models/User');

// Network UI
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user.userid)
            .populate('pendingRequests', 'username fullName avatar')
            .populate('friends', 'username fullName avatar')
            .populate('sentRequests', 'username fullName avatar');
        return res.render('networkUI', {
            user: req.user,
            friends: user.friends,
            pendingRequests: user.pendingRequests,
            pendingRequestsCount: user.pendingRequests.length
        });
    } catch (error) {
        console.error('Error rendering network page:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Get friend data (for AJAX updates)
router.get('/friends', networkController.getFriendData);

// Search users
router.get('/search', networkController.searchUsers);

// Friend request actions
router.post('/send-request', networkController.sendFriendRequest);
router.post('/accept-request', networkController.acceptFriendRequest);
router.post('/decline-request', networkController.declineFriendRequest);
router.post('/remove-friend', networkController.removeFriend);

module.exports = router;