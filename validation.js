
// ======================== USER AUTHENTICATION VALIDATION (server side) ========================
//Provides the comprehensive validation functions for all user inputs


//validates email
exports.validateEmail = (email) => {
    //checks if email is provided and is a string
    if (!email || typeof email !== 'string') {
        return { isValid: false, error: 'Email is required' };
    }
    //trims whitespace at start and end of email then validates if there is a string
    const email_trimmed = email.trim();
    if (email_trimmed.length === 0) {
        return { isValid: false, error: 'Email cannot be empty' };
    }
    // checks email length
    if (email_trimmed.length > 255) {
        return { isValid: false, error: 'Email is too long (max 255 characters)' };
    }

    // Define a regular expression (regex) to check for a basic email structure for example local@domain.tld.
    const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // If the format does NOT match the pattern, return a format error.
    if (!emailRegex.test(email_trimmed)) {
        return { isValid: false, error: 'Invalid email format' };
    }
    //  If all checks pass, return 'true' validation status and return the clean, trimmed email string for use.
    return { isValid: true, sanitized: email_trimmed };
};

 //Validate username format
exports.validateUsername = (username) => {
    // Check if the username input is missing  or not a string.
    if (!username || typeof username !== 'string') {
        return { isValid: false, error: 'Username is required' };
    }

    // Remove any leading or trailing whitespace from the username string.
    const username_trimmed = username.trim();
    
    // Check if the username becomes completely empty after trimming.
    if (username_trimmed.length === 0) {
        return { isValid: false, error: 'Username cannot be empty' };
    }

    // Check if the trimmed username is shorter than the minimum required length (3 characters).
    if (username_trimmed.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters' };
    }

    // Check if the trimmed username is longer than the maximum allowed length (50 characters).
    if (username_trimmed.length > 50) {
        return { isValid: false, error: 'Username must be at most 50 characters' };
    }

    // Define a regular expression (regex) to enforce allowed characters.
    // The pattern allows letters , numbers , underscore , and hyphen
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    
    // Test the trimmed username against the defined pattern.
    if (!usernameRegex.test(username_trimmed)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
    }

    // If all checks pass, return 'true' validation status.
    return { isValid: true, sanitized: username_trimmed };
};

//Validate password strength
exports.validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { isValid: false, error: 'Password is required' };
    }
    // Checks for password length and if above the maximum length.
    //no trimming due to whitespace possibly being part of password
    if (password.length === 0) {
        return { isValid: false, error: 'Password cannot be empty' };
    }

    if (password.length > 128) {
        return { isValid: false, error: 'Password must be at most 128 characters' };
    }

    return { isValid: true };
};

// Validate full name

exports.validateFullName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') { //if fullName is missing or not a string
        return { isValid: false, error: 'Full name is required' };
    }

    const name_trimmed = fullName.trim(); //trim whitespace at start and end of fullName
    if (name_trimmed.length === 0) {
        return { isValid: false, error: 'Full name cannot be empty' };
    }

    if (name_trimmed.length < 2) { //minimum length check
        return { isValid: false, error: 'Full name must be at least 2 characters' };
    }

    if (name_trimmed.length > 100) { //maximum length check
        return { isValid: false, error: 'Full name must be at most 100 characters' };
    }

    // Allow letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/; //define a regex pattern
    if (!nameRegex.test(name_trimmed)) { //test the trimmed name against the pattern
        return { isValid: false, error: 'Full name can only contain letters, spaces, hyphens, and apostrophes' };
    }

    return { isValid: true, sanitized: name_trimmed }; //return valid status and sanitized name
};

// Validate birthday

exports.validateBirthday = (birthday) => {
    if (!birthday || typeof birthday !== 'string') { //if birthday is missing or not a string
        return { isValid: false, error: 'Birthday is required' };
    }

    const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/; //regex pattern for YYYY-MM-DD format
    if (!birthdayRegex.test(birthday)) {  //test the birthday string against the pattern
        return { isValid: false, error: 'Birthday must be in YYYY-MM-DD format' };
    }

    const birthDate = new Date(birthday); //create a Date object from the birthday string
    const today = new Date(); //get today's date

    // Check if date is valid
    if (isNaN(birthDate.getTime())) { 
        return { isValid: false, error: 'Invalid birthday date' };
    }

    // Check if date is not in the future
    if (birthDate > today) {
        return { isValid: false, error: 'Birthday cannot be in the future' };
    }

    // Check if person is at least 13 years old
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (age < 13 || (age === 13 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) { 
        return { isValid: false, error: 'You must be at least 13 years old' };
    }

    // Check if person is not unreasonably old (over 150 years)
    if (age > 150) {
        return { isValid: false, error: 'Invalid birthday' };
    }

    return { isValid: true };
};

// ======================== FLIGHT VALIDATION ========================

//Validate flight number format
exports.validateFlightNumber = (flightNumber) => { 
    if (!flightNumber || typeof flightNumber !== 'string') { //if flightNumber is missing or not a string
        return { isValid: false, error: 'Flight number is required' };
    }

    const flightNum_trimmed = flightNumber.trim().toUpperCase(); //trim whitespace and convert to uppercase
    if (flightNum_trimmed.length === 0) { 
        return { isValid: false, error: 'Flight number cannot be empty' };
    }

    if (flightNum_trimmed.length > 10) { //maximum length check
        return { isValid: false, error: 'Flight number must be at most 10 characters' };
    }

    // Flight number format: airline code (2-3 letters) + number (1-4 digits) fr DL123
    const flightRegex = /^[A-Z]{2,3}\d{1,4}$/;
    if (!flightRegex.test(flightNum_trimmed)) {
        return { isValid: false, error: 'Invalid flight number format (e.g., AA123, PR1234)' };
    }

    return { isValid: true, sanitized: flightNum_trimmed };
};

//Validate airport destination
exports.validateAirportCode = (code) => { 
    if (!code || typeof code !== 'string') {
        return { isValid: false, error: 'Destination is required' };
    }

    // Normalize whitespace by trimming multiple spaces to a single space
    const code_trimmed = code.trim().replace(/\s+/g, ' '); 
    if (code_trimmed.length < 2) { //minimum length check
        return { isValid: false, error: 'Destination must be at least 2 characters' }; 
    }

    if (code_trimmed.length > 100) { //maximum length check
        return { isValid: false, error: 'Destination must be at most 100 characters' };
    }

    // Allow letters, spaces, hyphens, periods and apostrophes 
    const nameRegex = /^[a-zA-Z\s\-\.\'’]+$/; 
    if (!nameRegex.test(code_trimmed)) {
        return { isValid: false, error: 'Invalid destination format' };
    }

    // Convert to Title Case while preserving hyphens in the words
    const sanitized = code_trimmed.split(' ').map(word => { 
        return word.split('-').map(part => {
            if (part.length === 0) return part; 
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }).join('-');
    }).join(' ');

    return { isValid: true, sanitized };
};

// Validate date and time
exports.validateDateTime = (date, time) => {
    // Validate date is given as a string
    if (!date || typeof date !== 'string') {
        return { isValid: false, error: 'Date is required' };
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; //regex pattern for YYYY-MM-DD format
    if (!dateRegex.test(date)) { 
        return { isValid: false, error: 'Date must be in YYYY-MM-DD format' };
    }

    const dateObj = new Date(date); //create Date object from date string
    if (isNaN(dateObj.getTime())) { //check if date is valid
        return { isValid: false, error: 'Invalid date' };
    }

    const today = new Date(); //get today's date
    today.setHours(0, 0, 0, 0); //set to start of the day
    if (dateObj < today) { //check if date is in the past
        return { isValid: false, error: 'Date cannot be in the past' }; 
    }

    // Validate time
    if (!time || typeof time !== 'string') { //if time is missing or not a string
        return { isValid: false, error: 'Time is required' }; 
    }

    const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/; //regex pattern for HH:MM format (24-hour)
    if (!timeRegex.test(time)) { //check if time matches the pattern
        return { isValid: false, error: 'Time must be in HH:MM format (24-hour)' }; 
    }

    return { isValid: true };
};

// Validate seat capacity
exports.validateSeatCapacity = (seatCapacity) => {  
    if (seatCapacity === undefined || seatCapacity === null) { //if seatCapacity is missing
        return { isValid: false, error: 'Seat capacity is required' };
    }

    const capacity = parseInt(seatCapacity, 10); //parse seat capacity as an integer
    if (isNaN(capacity)) {
        return { isValid: false, error: 'Seat capacity must be a number' };
    }

    if (capacity < 10) { //check if seat capacity is less than 10
        return { isValid: false, error: 'Seat capacity must be at least 10' };
    }

    if (capacity > 500) { //check if seat capacity exceeds 500
        return { isValid: false, error: 'Seat capacity cannot exceed 500' };
    }

    return { isValid: true, sanitized: capacity };
};

// Validate price
exports.validatePrice = (price) => {
    if (price === undefined || price === null) {
        return { isValid: false, error: 'Price is required' };
    }

    const priceNum = parseFloat(price); //parse price as a floating-point number
    if (isNaN(priceNum)) { //check if price is a valid number
        return { isValid: false, error: 'Price must be a valid number' };
    }

    if (priceNum < 0) { //check if price is negative
        return { isValid: false, error: 'Price cannot be negative' };
    }

    if (priceNum > 10000) { //check if price exceeds 10,000
        return { isValid: false, error: 'Price cannot exceed 10,000' };
    }

    return { isValid: true, sanitized: priceNum.toFixed(2) };
};

/**
 * Validate text field (generic)
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {object} - { isValid: boolean, error: string }
 */
exports.validateTextField = (value, fieldName = 'Field', minLength = 1, maxLength = 255) => {
    if (!value || typeof value !== 'string') {
        return { isValid: false, error: `${fieldName} is required` };
    }

    const trimmed = value.trim(); //trim whitespace
    if (trimmed.length === 0) {
        return { isValid: false, error: `${fieldName} cannot be empty` };
    }

    if (trimmed.length < minLength) { //minimum length check
        return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
    }

    if (trimmed.length > maxLength) { //maximum length check
        return { isValid: false, error: `${fieldName} must be at most ${maxLength} characters` };
    }

    return { isValid: true, sanitized: trimmed }; 
};

// ======================== BOOKING VALIDATION ========================

// Validate passport ID
exports.validatePassportId = (passportId) => {
    if (!passportId || typeof passportId !== 'string') {
        return { isValid: false, error: 'Passport ID is required' };
    }

    const passport_trimmed = passportId.trim().toUpperCase(); //trim whitespace and convert to uppercase
    if (passport_trimmed.length === 0) { 
        return { isValid: false, error: 'Passport ID cannot be empty' };
    }

    if (passport_trimmed.length < 5 || passport_trimmed.length > 20) { //length check
        return { isValid: false, error: 'Passport ID must be between 5 and 20 characters' };
    }

    // Allow letters and numbers
    const passportRegex = /^[A-Z0-9]{5,20}$/; //define regex pattern
    if (!passportRegex.test(passport_trimmed)) { //test the trimmed passport ID against the pattern
        return { isValid: false, error: 'Passport ID can only contain letters and numbers' };
    }

    return { isValid: true, sanitized: passport_trimmed };
};

// Validate seat selection
exports.validateSeat = (seat) => {
    if (!seat || typeof seat !== 'string') {
        return { isValid: false, error: 'Seat selection is required' };
    }

    const seat_trimmed = seat.trim().toUpperCase(); //trim whitespace and convert to uppercase
    if (seat_trimmed.length === 0) {
        return { isValid: false, error: 'Seat cannot be empty' };
    }

    // Seat format: row number (1-3 digits) + letter (A-F)
    const seatRegex = /^([1-9]|[1-9]\d|[1-9]\d{2})[A-F]$/; //define regex pattern
    if (!seatRegex.test(seat_trimmed)) { //test the trimmed seat against the pattern
        return { isValid: false, error: 'Invalid seat format (e.g., 1A, 12F)' };
    }

    return { isValid: true, sanitized: seat_trimmed };
};


// Validate meal option

exports.validateMealOption = (meal) => {
    // Match the meal options available in the reservation form template.
    const validMeals = ['Standard', 'Vegetarian', "Religious", "Medical", "Children's Meal", 'Gluten-Free', 'Halal', 'Kosher'];

    return { isValid: true, sanitized: mealTrimmed };
};

// Validate extra baggage
exports.validateExtraBaggage = (baggage) => { 
    if (baggage === undefined || baggage === null || baggage === '') { 
        return { isValid: true, sanitized: 0 }; // Default to 0
    }

    const baggageNum = parseInt(baggage, 10); //parse baggage as an integer
    if (isNaN(baggageNum)) { 
        return { isValid: false, error: 'Extra baggage must be a number' };
    }

    if (baggageNum < 0) { //check if baggage is negative
        return { isValid: false, error: 'Extra baggage cannot be negative' };
    }

    return { isValid: true, sanitized: baggageNum };
};

// Validate MongoDB ID
exports.validateMongoId = (id) => { 
    if (!id || typeof id !== 'string') {
        return { isValid: false, error: 'ID is required' }; 
    }

    // MongoDB ObjectId is a 24-character hexadecimal string
    const mongoIdRegex = /^[0-9a-f]{24}$/i;
    if (!mongoIdRegex.test(id)) {
        return { isValid: false, error: 'Invalid ID format' };
    }

    return { isValid: true };
};

// Validate registration data
exports.validateRegistrationData = (data) => {
    const errors = [];

    // Validate full name
    const nameValidation = this.validateFullName(data.fullName);
    if (!nameValidation.isValid) errors.push(nameValidation.error);

    // Validate username
    const usernameValidation = this.validateUsername(data.username);
    if (!usernameValidation.isValid) errors.push(usernameValidation.error);

    // Validate email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) errors.push(emailValidation.error);

    // Validate birthday
    const birthdayValidation = this.validateBirthday(data.birthday);
    if (!birthdayValidation.isValid) errors.push(birthdayValidation.error);

    // Validate password
    const passwordValidation = this.validatePassword(data.password); 
    if (!passwordValidation.isValid) errors.push(passwordValidation.error);

    // Check password confirmation
    if (data.password !== data.confPassword) {
        errors.push('Passwords do not match');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};
