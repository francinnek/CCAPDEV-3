const bcrypt = require('bcrypt');
const session = require('express-session');
const Profile = require('../models/Profile');
const Booking = require('../models/Booking');
const validation = require('../utils/validation');
const saveLog = require('./logger');

// 🔐 Pre-save hook to hash password before saving
async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    } catch (error) {
        console.error('Error hashing password:', error);
        return null;
    }
};

// ➕ Add method to compare password
async function comparePassword(plainPassword, hashedPassword) {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error('Error comparing password:', error);
        return null;
    }
};

const authController = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // SERVER-SIDE VALIDATION
            if (!username || !password) {
                saveLog(req.session.user.username,`❌ User ${req.session.user.email} left username and/or password fields empty.`);
                return res.render('loginform', { 
                    error: 'Username and password are required' 
                });
            }

            // Validate username format
            const usernameValidation = validation.validateUsername(username);
            if (!usernameValidation.isValid) {
                saveLog(req.session.user.username, `❌ Invalid username entered by ${req.session.user.email}.`);
                return res.render('loginform', { 
                    error: usernameValidation.error 
                });
            }

            // Validate password is not empty
            if (typeof password !== 'string' || password.length === 0) {
                saveLog(req.session.user.username,`❌ User ${req.session.user.email} left password fields empty.`);
                return res.render('loginform', { 
                    error: 'Password cannot be empty' 
                });
            }

            if (password.length > 128) {
                saveLog(req.session.user.username,`❌ User ${req.session.user.email} entered an invalid password format.`);
                return res.render('loginform', { 
                    error: 'Invalid password format' 
                });
            }

            const user = await validateUser(usernameValidation.sanitized, password);

            if (user) {
                req.session.user = {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,      
                    birthday: user.birthday,      
                    isAdmin: user.isAdmin,
                    isMember: user.isMember
                };
            
                saveLog(req.session.user.username,`✅ User ${req.session.user.email} successfully logged in!`);
                res.redirect(`/admin?user=${encodeURIComponent(user.username)}`); 

            } else {
                saveLog(req.session.user.username,`❌ User log in unsuccessful: ${req.session.user.email}`);
                res.render('loginform', { 
                    error: 'Invalid username or password' 
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            res.render('loginform', { 
                error: '❌ Server error during login' 
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

            //SERVER-SIDE VALIDATION using validation.js
            const registrationValidation = validation.validateRegistrationData({
                fullName,
                username,
                birthday,
                email,
                password,
                confPassword
            });

            if (!registrationValidation.isValid) {
                saveLog(req.session.user.username,`❌ Invalid registration data entered by ${req.session.user.email}.`);
                return res.render('register', {
                    error: registrationValidation.errors.join(', '),
                    formData: { fullName, username, birthday, email }
                });
            }

            const registered = await registerUser(fullName, username, birthday, email, password);
            if (registered) {
                saveLog(req.session.user.username, `✅ User ${req.session.user.email} successfully registered!`);
                res.redirect('/loginOrRegister/login?message=Registration successful');
            } else {
                res.render('register', {
                    error: 'There was an error during registration',
                    formData: { fullName, username, birthday, email }
                });
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            res.render('register', {
                error: 'Server error during registration',
                formData: req.body
            });
        }
    },

    logout: (req, res) => {
        saveLog(req.session.user.username, `✅ User ${req.session.user.email} successfully logged out.`);
        req.session.destroy((err) => {
            if (err) {
                console.error('❌ Session destruction error:', err);
            }
            res.redirect('/loginOrRegister/login?message=Logged out successfully');
        });
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

    changePassword: async (req, res) => {
        try {
            const { username, currentPassword, newPassword, confirmPassword } = req.body;
            saveLog(req.session.user.username, `🔐 Password change attempt for ${username}`);

            //SERVER-SIDE VALIDATION
            if (!username || !currentPassword || !newPassword || !confirmPassword) { 
                saveLog(req.session.user.username,`❗️ All fields are required for password change ${username}`);
                return res.render('change-password', {
                    title: 'Change Password - DLSU Airlines', 
                    error: 'All fields are required',
                    username: username
                });
            }

            // Validate password 
            const passwordValidation = validation.validatePassword(newPassword); 
            if (!passwordValidation.isValid) {
                saveLog(req.session.user.username, `❌ Invalid password format for ${username}`);
                return res.render('change-password', {
                    title: 'Change Password - DLSU Airlines',
                    error: passwordValidation.error,
                    username: username
                });
            }

            if (newPassword !== confirmPassword) {
                saveLog(req.session.user.username, `❌ Password mismatch for user ${username}`);
                return res.render('change-password', {
                    title: 'Change Password - DLSU Airlines',
                    error: 'New passwords do not match',
                    username: username
                });
            }

            const user = await Profile.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            });

            if (!user) {
                console.log(`❌ User not found for password change: ${username}`);
                return res.render('change-password', {
                    title: 'Change Password - DLSU Airlines',
                    error: 'User not found',
                    username: username
                });
            }

            // Use bcrypt comparison
            const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                saveLog(req.session.user.username, `❌ Incorrect current password for user ${username}`);
                return res.render('change-password', {
                    title: 'Change Password - DLSU Airlines',
                    error: 'Current password is incorrect',
                    username: username
                });
            }

            // Hash new password
            const hashedNewPassword = await hashPassword(newPassword);
            await Profile.updateOne(
                { 
                    $or: [
                        { username: username },
                        { email: username }
                    ]
                },
                { password: hashedNewPassword }
            );

            saveLog(req.session.user.username, `✅ Password changed successfully for ${username}`);
            res.redirect(`/admin?user=${encodeURIComponent(username)}&message=Password changed successfully`);

        } catch (error) {
            console.error('❌ Password change error:', error);
            res.render('change-password', {
                title: 'Change Password - DLSU Airlines',
                error: 'Server error during password change',
                username: req.session?.user?.username
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
                console.log(`❌ User not found.`);
                return res.redirect('/loginOrRegister/login?error=User not found');
            }

            res.render('edit-profile', {
                title: 'Edit Profile - DLSU Airlines',
                error: null,
                profile: profile,
                formData: profile
            });
        } catch (error) {
            console.error('❌ Edit profile form error:', error);
            res.redirect('/loginOrRegister/login?error=Server error');
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { originalUsername, username, fullName, birthday, email } = req.body;

            //SERVER-SIDE VALIDATION
            const nameValidation = validation.validateFullName(fullName);
            if (!nameValidation.isValid) {
                saveLog(req.session.user.username, `❌ Invalid name entered by ${req.session.user.email}.`);
                return res.render('edit-profile', {
                    title: 'Edit Profile - DLSU Airlines',
                    error: nameValidation.error,
                    profile: { 
                        username: originalUsername, 
                        fullName, 
                        birthday, 
                        email 
                    }
                });
            }

            const usernameValidation = validation.validateUsername(username);
            if (!usernameValidation.isValid) {
                saveLog(req.session.user.username, `❌ Invalid username entered by ${req.session.user.email}.`);
                return res.render('edit-profile', {
                    title: 'Edit Profile - DLSU Airlines',
                    error: usernameValidation.error,
                    profile: { 
                        username: originalUsername, 
                        fullName, 
                        birthday, 
                        email 
                    }
                });
            }

            const birthdayValidation = validation.validateBirthday(birthday);
            if (!birthdayValidation.isValid) {
                saveLog(req.session.user.username, `❗️ Invalid birthday entered by ${req.session.user.email}.`);
                return res.render('edit-profile', {
                    title: 'Edit Profile - DLSU Airlines',
                    error: birthdayValidation.error,
                    profile: { 
                        username: originalUsername, 
                        fullName, 
                        birthday, 
                        email 
                    }
                });
            }

            const emailValidation = validation.validateEmail(email);
            if (!emailValidation.isValid) {
                saveLog(req.session.user.username, `❗️ Invalid email entered by ${req.session.user.email}.`);
                return res.render('edit-profile', {
                    title: 'Edit Profile - DLSU Airlines',
                    error: emailValidation.error,
                    profile: { 
                        username: originalUsername, 
                        fullName, 
                        birthday, 
                        email 
                    }
                });
            }

            if (!fullName || !birthday || !email || !username) {
                saveLog(req.session.user.username, `❌ All fields are left empty by ${req.session.user.email}.`);
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
                    username: { $ne: originalUsername }
                });

                if (existingUsername) {
                    saveLog(req.session.user.username, `❗️ Username already exists by ${req.session.user.email}.`);
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
                    username: usernameValidation.sanitized,
                    fullName: nameValidation.sanitized,
                    birthday: new Date(birthday)
                }
            );

            if (updateResult.modifiedCount === 0) {
                saveLog(req.session.user.username, `❌ Profile not found or no changes made by ${req.session.user.email}.`);
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
                        { username: usernameValidation.sanitized }
                    );
                    saveLog(req.session.user.username, `✅ User ${req.session.user.email} successfully updated username in bookings`);
                } catch (bookingError) {
                    console.error('⚠️ Could not update bookings (might not exist):', bookingError);
                }
            }

            // Redirect back to admin with success message and NEW username
            saveLog(req.session.user.username, `✅ User ${req.session.user.email} successfully updated profile!`);
            res.redirect(`/admin?user=${encodeURIComponent(usernameValidation.sanitized)}&message=Profile updated successfully`);

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

async function validateUser(username, password) {
    try {
        const user = await Profile.findOne({ 
            $or: [
                { username: username },
                { email: username }
            ]
        }).lean();

        if (user && await comparePassword(password, user.password)) {
            return user;
        }
        // return null;
    } catch (error) {
        console.error('Validation error:', error);
        return null;
    }
};

// MODIFY registerUser function
async function registerUser(fullName, username, birthday, email, password) {
    try {
        const existingUser = await Profile.findOne({ 
            $or: [{ email: email }, { username: username }] 
        }).lean();

        /*
            $or: A MongoDB logical operator. It takes an array of condition objects; a document matches if ANY of them is true.
                { username: username }: Matches documents where the username field equals the value held in the variable username.
                You could use the JavaScript object shorthand { username } since the property and variable name are identical.
                { email: username }: Matches documents where email equals the same input value (so the input can be either a username or an email).
        */

        if (existingUser) {
            throw new Error('User with this email or username already exists');
        }

        const isAdminEmail = email.toLowerCase().endsWith('@dlsu.airlines.ph');
        const hashedPassword = await hashPassword(password);

        const newProfile = new Profile({
            fullName: fullName,
            username: username,
            birthday: birthday,
            email: email,
            password: hashedPassword,
            isMember: true,
            isAdmin: isAdminEmail
        });

        await newProfile.save();
        // SECURITY LOGGING
        console.log(`🔐 SECURITY: User registered: ${username} ${isAdminEmail ? '(ADMIN)' : '(Regular User)'}.`);
        saveLog(req.session.user.username, `🔐 User ${req.session.user.email} successfully registered!`);
        return true;
    } catch (err) {
        console.error("❌ SECURITY: Registration error:", err.message);
        return false;
    }
};

module.exports = authController;