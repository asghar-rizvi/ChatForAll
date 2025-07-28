const User = require('../models/User');
const bcrypt = require('bcrypt');

async function getSettings(req, res) {
    try {
        const user = await User.findById(req.user.userid).select('-password');
        res.render('settings', { user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

async function updateProfile(req, res) {
    try {
        const { fullName, username, email, bio, location } = req.body;
        const updateData = { fullName, username, email, bio, location };
        if (req.file) {
            updateData.profileImage = `/uploads/${req.file.filename}`;
            req.user.profileImage =  updateData.profileImage;
            console.log('profile...', req.user)
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userid,
            updateData,
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            user: updatedUser,
            avatarUrl: req.file ? updateData.profileImage : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

async function updatePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userid);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.passwordUpdatedAt = Date.now();
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}


module.exports = {
    getSettings,
    updateProfile,
    updatePassword,
};