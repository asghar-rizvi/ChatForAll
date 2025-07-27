const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Messaage');

// 🔹 Show Chat UI
async function showChatUI(req, res) {
    try {
        const user = await User.findById(req.user.userid)
            .populate({
                path: 'friends',
                select: 'username fullName avatar isOnline lastMessage lastMessageTime unreadCount',
                options: { sort: { isOnline: -1, lastMessageTime: -1 } } // Sort by online status then recent messages
            });

        
        return res.render('chatUI', { 
            user: {
                _id: user._id,
                username: user.username,
                avatar: user.avatar,
                email: user.email
            },
            friends: user.friends.map(friend => ({
                _id: friend._id,
                username: friend.username,
                fullName: friend.fullName,
                avatar: friend.avatar,
                isOnline: friend.isOnline,
                lastMessage: friend.lastMessage,
                lastMessageTime: friend.lastMessageTime ? 
                    new Date(friend.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                unreadCount: friend.unreadCount || 0
            }))
        });
    } catch (err) {
        console.error('Chat UI Load Error:', err);
        return res.status(500).render('error', { message: 'Server Error' });
    }
}

// 🔹 Get chat with a specific friend (updated for real-time)
async function handleUserChatDisplay(req, res) {
    try {
        const currentUser = await User.findById(req.user.userid);
        const friendId = req.params.friendId; 

        // Fetch friend
        const friend = await User.findById(friendId);
        console.log('friend..', friend)
        if (!friend) return res.status(404).json({ message: 'Friend not found' });

        // Create consistent room name (alphabetical)
        const usernames = [currentUser.username, friend.username].sort();
        const roomName = `${usernames[0]}-${usernames[1]}`;

        // Get or create chat room
        let room = await ChatRoom.findOne({ roomName });
        if (!room) {
            room = await ChatRoom.create({
                roomName,
                users: [currentUser._id, friend._id],
            });
        }

        // Get messages (sorted by timestamp)
        const messages = await Message.find({ room: room._id })
            .populate('sender', 'username avatar')
            .sort({ createdAt: 1 });

        res.json({
            roomId: room._id,
            roomName,
            messages,
            friend: {
                _id: friend._id,
                username: friend.username,
                fullName: friend.fullName,
                avatar: friend.avatar,
                isOnline: friend.isOnline
            }
        });

    } catch (err) {
        console.error('Chat Load Error:', err);
        return res.status(500).json({ 
            message: 'Server error',
            error: err.message 
        });
    }
}

async function handleLogout(req, res){
    const curr_user = req.user.userid
    const user = await User.findById(curr_user);
    user.isOnline = false;
    await user.save();
    res.clearCookie('token');
    return res.redirect('/');
}

module.exports = {
    showChatUI,
    handleUserChatDisplay,
    handleLogout
};