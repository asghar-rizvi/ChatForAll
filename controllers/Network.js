const User = require('../models/User');
const room = require('../models/ChatRoom');
// Get complete friend data
exports.getFriendData = async (req, res) => {
    try {
        const user = await User.findById(req.user.userid)
            .populate('pendingRequests', 'username fullName avatar')
            .populate('friends', 'username fullName avatar')
            .populate('sentRequests', 'username fullName avatar');

        return res.status(200).json({
            pendingRequests: user.pendingRequests,
            friends: user.friends,
            sentRequests: user.sentRequests
        });
    } catch (error) {
        console.error('Error fetching friend data:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Search users with better query handling
exports.searchUsers = async (req, res) => {
    try {
        const keyword = req.query.q;
        
        if (!keyword || keyword.trim() === '') {
            return res.status(200).json([]);
        }

        // Get current user's network to exclude from search
        const currentUser = await User.findById(req.user.userid);
        const excludedIds = [
            req.user.userid,
            ...currentUser.friends,
            ...currentUser.pendingRequests,
            ...currentUser.sentRequests
        ];

        const users = await User.find({
            $or: [
                { username: { $regex: keyword, $options: 'i' } },
                { fullName: { $regex: keyword, $options: 'i' } }
            ],
            _id: { $nin: excludedIds }
        }).select('username fullName avatar').limit(10);

        return res.status(200).json(users);
    } catch (error) {
        console.error('Search error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Enhanced friend request sending
exports.sendFriendRequest = async (req, res) => {
    try {
        const targetUserId = req.body.userId;
        
        if (req.user.userid === targetUserId) {
            return res.status(400).json({ message: 'Cannot send request to yourself' });
        }

        const [currentUser, targetUser] = await Promise.all([
            User.findById(req.user.userid),
            User.findById(targetUserId)
        ]);

        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        // Check existing relationships
        if (currentUser.friends.includes(targetUserId)) {
            return res.status(400).json({ message: 'Already friends with this user' });
        }
        
        if (currentUser.sentRequests.includes(targetUserId)) {
            return res.status(400).json({ message: 'Request already sent' });
        }
        
        if (currentUser.pendingRequests.includes(targetUserId)) {
            return res.status(400).json({ message: 'This user has already sent you a request' });
        }

        // Add to sent and pending requests
        currentUser.sentRequests.push(targetUserId);
        targetUser.pendingRequests.push(req.user.userid);

        await Promise.all([currentUser.save(), targetUser.save()]);

        return res.status(200).json({ 
            message: 'Friend request sent',
            targetUser: {
                _id: targetUser._id,
                username: targetUser.username,
                fullName: targetUser.fullName,
                avatar: targetUser.avatar
            }
        });
    } catch (error) {
        console.error('Send request error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Improved friend request acceptance
exports.acceptFriendRequest = async (req, res) => {
    try {
        const requesterId = req.body.userId;
        const [user, requester] = await Promise.all([
            User.findById(req.user.userid),
            User.findById(requesterId)
        ]);

        if (!requester) return res.status(404).json({ message: 'User not found' });

        // Verify request exists
        if (!user.pendingRequests.includes(requesterId)) {
            return res.status(400).json({ message: 'No pending request from this user' });
        }

        // Update relationships
        user.pendingRequests = user.pendingRequests.filter(id => id.toString() !== requesterId);
        requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== req.user.userid);
        
        if (!user.friends.includes(requesterId)) {
            user.friends.push(requesterId);
        }
        
        if (!requester.friends.includes(req.user.userid)) {
            requester.friends.push(req.user.userid);
        }

        await Promise.all([user.save(), requester.save()]);

        // ROOM NAME FOR PRIVATE CONVERSATIONS ;)
        const usernames = [user.username, requester.username].sort(); 
        const roomName = `${usernames[0]}-${usernames[1]}`;

        const existingRoom = await ChatRoom.findOne({ roomName });

        if (!existingRoom) {
            await ChatRoom.create({
                roomName,
                users: [user._id, requester._id]
            });
        }

        return res.status(200).json({ 
            message: 'Friend request accepted',
            newFriend: {
                _id: requester._id,
                username: requester.username,
                fullName: requester.fullName,
                avatar: requester.avatar
            }
        });
    } catch (error) {
        console.error('Accept request error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// New decline request function
exports.declineFriendRequest = async (req, res) => {
    try {
        const requesterId = req.body.userId;
        const [user, requester] = await Promise.all([
            User.findById(req.user.userid),
            User.findById(requesterId)
        ]);

        if (!requester) return res.status(404).json({ message: 'User not found' });

        // Verify request exists
        if (!user.pendingRequests.includes(requesterId)) {
            return res.status(400).json({ message: 'No pending request from this user' });
        }

        // Remove from pending and sent requests
        user.pendingRequests = user.pendingRequests.filter(id => id.toString() !== requesterId);
        requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== req.user.userid);

        await Promise.all([user.save(), requester.save()]);

        return res.status(200).json({ 
            message: 'Friend request declined',
            declinedUser: {
                _id: requester._id,
                username: requester.username
            }
        });
    } catch (error) {
        console.error('Decline request error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Enhanced friend removal
exports.removeFriend = async (req, res) => {
    try {
        const friendId = req.body.userId;
        const [user, friend] = await Promise.all([
            User.findById(req.user.userid),
            User.findById(friendId)
        ]);

        if (!friend) return res.status(404).json({ message: 'User not found' });

        // Remove from friends lists
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== req.user.userid);

        // Also remove any pending/sent requests if they exist
        user.pendingRequests = user.pendingRequests.filter(id => id.toString() !== friendId);
        user.sentRequests = user.sentRequests.filter(id => id.toString() !== friendId);
        friend.pendingRequests = friend.pendingRequests.filter(id => id.toString() !== req.user.userid);
        friend.sentRequests = friend.sentRequests.filter(id => id.toString() !== req.user.userid);

        await Promise.all([user.save(), friend.save()]);

        return res.status(200).json({ 
            message: 'Friend removed successfully',
            removedFriend: {
                _id: friend._id,
                username: friend.username
            }
        });
    } catch (error) {
        console.error('Remove friend error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};