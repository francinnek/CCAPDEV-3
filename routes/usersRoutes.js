const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// small helper to ensure only admins pass
async function requireAdmin(req, res, next) {
  try {
    const username = req.query.user || req.body?.username;
    if (!username) return res.status(403).render('error', { title: 'Forbidden', message: 'Missing user context' });

    const profile = await Profile.findOne({ $or: [{ username }, { email: username }] }).lean();
    if (!profile || profile.isAdmin !== true) {
      return res.status(403).render('error', { title: 'Forbidden', message: 'Admin access required' });
    }

    // stash for handlers
    req.admin = profile;
    next();
  } catch (e) {
    console.error('requireAdmin error:', e);
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
    // block self-delete (optional but sensible)
    const toDelete = await Profile.findById(req.params.id).lean();
    if (!toDelete) return res.status(404).json({ success: false, message: 'User not found' });

    if (toDelete._id.toString() === req.admin._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    await Profile.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

module.exports = router;
