// const Profile = require('../models/Profile');
// const session = require('express-session');

function userRole(role) {
  return function (req, res, next) {
    if (!req.session.user) {
      return res.redirect('/loginOrRegister/login?error=Please login first');
    };
    // Example logic using the role
    // if (req.session.userId && req.session.user.isAdmin === (role === 'admin')) {
    //   return next();
    // } else {
    //     req.session.destroy(() => {
    //         res.redirect('/login');
    //     });
    // }
    if (role === 'admin') {
      if (req.session.user.isAdmin) {
        return next();
      } else {
        // console.warn(`❌ SECURITY: Unauthorized admin access attempt by: ${sessionUser.username}`);
        return res.status(403).render('error', { title: 'Forbidden', message: 'Admin access required' });
      }
    };

    if (role === 'user') {
      return next(); // Allow any logged-in user
    } else {
      res.status(403).send('Access denied');
    }

  }
};

module.exports = userRole;

/* 

// ALTERNATIVE IF ABOVE DOESN'T WORK

function userRole(requiredRole) {
  return function (req, res, next) {
    // Check authentication first
    if (!req.session.user) {
      console.log(`❌ SECURITY: Unauthenticated access attempt from IP: ${req.ip}`);
      return res.redirect('/loginOrRegister/login?error=Please login first');
    }

    // Role-based access control
    if (requiredRole === 'admin') {
      if (req.session.user.isAdmin) {
        return next();
      }
    } else if (requiredRole === 'user') {
      // Any authenticated user can access user routes
      return next();
    } else if (requiredRole === 'member') {
      if (req.session.user.isMember) {
        return next();
      }
    }

    // Access denied
    console.log(`❌ SECURITY: Authorization failed - User: ${req.session.user.username} required ${requiredRole} role`);
    res.status(403).render('error', {
      title: 'Access Denied',
      message: `You need ${requiredRole} privileges to access this page`
    });
  }
};

*/

/* 

// ALTERNATIVE #2

// userAuth-middleware/userRoleAuth.js
module.exports = function userRole(requiredRole) {
  return async function (req, res, next) {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser) {
        // Not signed in
        return res.redirect('/loginOrRegister/login?error=Please login first');
      }

      // Admin access check
      if (requiredRole === 'admin') {
        if (sessionUser.isAdmin === true) {
          return next();
        } else {
          console.warn(`❌ SECURITY: Unauthorized admin access attempt by: ${sessionUser.username}`);
          return res.status(403).render('error', { title: 'Forbidden', message: 'Admin access required' });
        }
      }

      // User access: must be authenticated (we already validated)
      if (requiredRole === 'user') {
        return next();
      }

      // Unknown role: deny
      res.status(403).render('error', { title: 'Forbidden', message: 'Role not recognized' });
    } catch (err) {
      console.error('❌ userRoleAuth error:', err);
      return res.status(500).render('error', { title: 'Server Error', message: 'Authentication failed' });
    }
  };
};

*/