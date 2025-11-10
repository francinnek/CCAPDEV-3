// This handles the actual login logic on the server
const Profile = require('../models/Profile');

const authController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            const user = await validateUser(username, password);

            if (user) {
                res.redirect(`/admin?user=${encodeURIComponent(username)}`);
            } else {
                res.render('loginform', { 
                    error: 'Invalid username or password' 
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            res.render('loginform', { 
                error: 'Server error during login' 
            });
        }
    },

    register: async (req, res) => {
        try {
            const {
                fullName,
                username,
                birthday,
                email,
                password, 
                confPassword
            } = req.body;

            if (password !== confPassword) {
                return res.render('register', {
                    error: 'Passwords do not match',
                    formData: { fullName, username, birthday, email }
                });
            }

            const registered = await registerUser(fullName, username, birthday, email, password);
            if (registered) {
                res.redirect('/loginOrRegister/login?message=Registration successful');
            } else {
                res.render('register', {
                    error: 'There was an error during registration',
                    formData: { fullName, username, birthday, email }
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            res.render('register', {
                error: 'Server error during registration',
                formData: req.body
            });
        }
    },

    logout: (req, res) => {
        res.redirect('/loginOrRegister/login?message=Logged out successfully');
    },

    showLoginForm: (req, res) => {
        const message = req.query.message;
        res.render('loginform', { 
            error: null,
            message: message 
        });
    },

    showRegisterForm: (req, res) => {
        res.render('register', { 
            error: null, 
            formData: {} 
        });
    },

    showChangePasswordForm: (req, res) => {
        const username = req.query.user;
        res.render('change-password', {
            title: 'Change Password - DLSU Airlines',
            error: null,
            username: username
        });
    },

    // NEW: Handle password change
    changePassword: async (req, res) => {
        try {
            const { username, currentPassword, newPassword, confirmPassword } = req.body;

            console.log('🔐 Password change attempt for:', username);

            // Validate inputs
            if (newPassword !== confirmPassword) {
                return res.render('change-password', {
                    title: 'Change Password - DLSU Airlines',
                    error: 'New passwords do not match',
                    username: username
                });
            }

            // Verify current password
            const user = await Profile.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            }).lean();

            if (!user) {
                return res.render('change-password', {
                    title: 'Change Password - DLSU Airlines',
                    error: 'User not found',
                    username: username
                });
            }

            if (user.password !== currentPassword) {
                return res.render('change-password', {
                    title: 'Change Password - DLSU Airlines',
                    error: 'Current password is incorrect',
                    username: username
                });
            }

            // Update password
            await Profile.updateOne(
                { 
                    $or: [
                        { username: username },
                        { email: username }
                    ]
                },
                { password: newPassword }
            );

            console.log('✅ Password changed successfully for:', username);
            res.redirect(`/admin?user=${encodeURIComponent(username)}&message=Password changed successfully`);

        } catch (error) {
            console.error('Password change error:', error);
            res.render('change-password', {
                title: 'Change Password - DLSU Airlines',
                error: 'Server error during password change',
                username: req.body.username
            });
        }
    },

    showEditProfileForm: async (req, res) => {
        try {
            const username = req.query.user;
            
            if (!username) {
                return res.redirect('/loginOrRegister/login?error=User not identified');
            }

            const profile = await Profile.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            }).lean();

            if (!profile) {
                return res.redirect('/loginOrRegister/login?error=User not found');
            }

            res.render('edit-profile', {
                title: 'Edit Profile - DLSU Airlines',
                error: null,
                profile: profile,
                formData: profile
            });
        } catch (error) {
            console.error('Edit profile form error:', error);
            res.redirect('/loginOrRegister/login?error=Server error');
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { originalUsername, username, fullName, birthday, email } = req.body;

            console.log('📝 Profile update attempt for:', originalUsername, '->', username);

            if (!fullName || !birthday || !email || !username) {
                return res.render('edit-profile', {
                    title: 'Edit Profile - DLSU Airlines',
                    error: 'All fields are required',
                    profile: { 
                        username: originalUsername, 
                        fullName, 
                        birthday, 
                        email 
                    }
                });
            }

            // Check if username is being changed and if new username already exists
            if (originalUsername !== username) {
                const existingUsername = await Profile.findOne({ 
                    username: username,
                    username: { $ne: originalUsername } // Exclude current user
                });

                if (existingUsername) {
                    return res.render('edit-profile', {
                        title: 'Edit Profile - DLSU Airlines',
                        error: 'Username already exists. Please choose a different one.',
                        profile: { 
                            username: originalUsername, 
                            fullName, 
                            birthday, 
                            email 
                        }
                    });
                }
            }

            // Update profile with potential new username (email remains the same)
            const updateResult = await Profile.updateOne(
                { username: originalUsername },
                { 
                    username: username,
                    fullName: fullName,
                    birthday: new Date(birthday)
                    // Email is NOT updated - it remains the same
                }
            );

            if (updateResult.modifiedCount === 0) {
                return res.render('edit-profile', {
                    title: 'Edit Profile - DLSU Airlines',
                    error: 'Profile not found or no changes made',
                    profile: { 
                        username: originalUsername, 
                        fullName, 
                        birthday, 
                        email 
                    }
                });
            }

            // Update username in bookings if username changed
            if (originalUsername !== username) {
                try {
                    await Booking.updateMany(
                        { username: originalUsername },
                        { username: username }
                    );
                    console.log('✅ Updated username in bookings:', originalUsername, '->', username);
                } catch (bookingError) {
                    console.error('⚠️ Could not update bookings (might not exist):', bookingError);
                    // Continue even if booking update fails - bookings might not exist for this user
                }
            }

            console.log('✅ Profile updated successfully:', originalUsername, '->', username);

            // Redirect back to admin with success message and NEW username
            res.redirect(`/admin?user=${encodeURIComponent(username)}&message=Profile updated successfully`);

        } catch (error) {
            console.error('Profile update error:', error);
            res.render('edit-profile', {
                title: 'Edit Profile - DLSU Airlines',
                error: 'Server error during profile update',
                profile: { 
                    username: req.body.originalUsername, 
                    fullName: req.body.fullName, 
                    birthday: req.body.birthday, 
                    email: req.body.email 
                }
            });
        }
    }
};

// Updated validateUser to return user data, not just boolean
async function validateUser(username, password) {
    try {
        const user = await Profile.findOne({ 
            $or: [
                { username: username },
                { email: username }
            ]
        }).lean();

        if (user && user.password === password) {
            return user;
        }
        return null;
    } catch (error) {
        console.error('Validation error:', error);
        return null;
    }
}

async function registerUser(fullName, username, birthday, email, password) {
    try {
        const existingUser = await Profile.findOne({ 
            $or: [{ email: email }, { username: username }] 
        }).lean();

        if (existingUser) {
            throw new Error('User with this email or username already exists');
        }

        const newProfile = new Profile({
            fullName: fullName,
            username: username,
            birthday: birthday,
            email: email,
            password: password,
            isMember: true,
            isAdmin: false
        });

        await newProfile.save();
        return true;
    } catch (err) {
        console.log("❌ Error registering the profile:", err.message);
        return false;
    }
}

module.exports = authController;