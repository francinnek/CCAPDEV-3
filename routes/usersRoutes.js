const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// small helper to ensure only admins pass
async function requireAdmin(req, res, next) {
  try {
    const username = req.session.user.username;
    if (!username) {
      return res.status(403).render('error', { title: 'Forbidden', message: 'Please login first' });
    }

    const profile = await Profile.findOne({ 
      $or: [
        { username }, 
        { email: username }
      ] 
    }).lean();
    
    if (!profile || profile.isAdmin !== true) {
      console.log(`❌ Admin access is required.`);
      return res.status(403).render('error', { title: 'Forbidden', message: 'Admin access required' });
    }

    req.admin = profile;
    next();
  } catch (e) {
    console.error('❌ SECURITY: requireAdmin error:', e);
    return res.status(500).render('error', { title: 'Server error', message: 'Admin check failed' });
  }
}

// GET /admin/users - list users
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await Profile.find({}).sort({ createdAt: -1 }).lean();
    res.render('manage-users', {
      title: 'Manage Users - DLSU Airlines',
      users,
      username: req.admin.username,
      isAdmin: true,
      active: { }, // keep header clean
      profile: req.admin, // to keep header links working
      message: req.query.message
    });
  } catch (err) {
    console.error('Error listing users:', err);
    res.status(500).render('error', { title: 'Server Error', message: 'Error loading users' });
  }
});

// DELETE /admin/users/:id - delete a user
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const toDelete = await Profile.findById(req.params.id).lean();
    if (!toDelete) return res.status(404).json({ success: false, message: 'User not found' });

    if (toDelete._id.toString() === req.admin._id.toString()) {
      console.log(`❌ SECURITY: Self-delete attempt by admin: ${req.admin.username}`);
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    };

    await Profile.findByIdAndDelete(req.params.id);
    console.log(`✅ SECURITY: User ${toDelete.username} deleted by admin: ${req.admin.username}`);
    return res.json({ success: true });
  } catch (err) {
    console.error('❌ SECURITY: Error deleting user:', err);
    return res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

module.exports = router;
