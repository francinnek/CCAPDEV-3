//Client side validation

const ClientValidation = { 
    // EMAIL VALIDATION
    validateEmail: function(email) {
        if (!email || email.trim() === '') {
            return { isValid: false, error: 'Email is required' };
        }

        const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email.trim())) {
            return { isValid: false, error: 'Please enter a valid email address' };
        }

        if (email.length > 255) {
            return { isValid: false, error: 'Email is too long' };
        }

        return { isValid: true, sanitized: email.trim() };
    },

    //USERNAME VALIDATION
    validateUsername: function(username) {
        if (!username || username.trim() === '') {
            return { isValid: false, error: 'Username is required' };
        }

        if (username.trim().length < 3) {
            return { isValid: false, error: 'Username must be at least 3 characters' };
        }

        if (username.trim().length > 50) {
            return { isValid: false, error: 'Username must be at most 50 characters' };
        }

        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(username.trim())) {
            return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
        }

        return { isValid: true, sanitized: username.trim() };
    },

    // PASSWORD VALIDATION
    validatePassword: function(password) {
        if (!password || password === '') {
            return { isValid: false, error: 'Password is required' };
        }

        if (typeof password !== 'string') {
            return { isValid: false, error: 'Invalid password format' };
        }

        if (password.length > 128) {
            return { isValid: false, error: 'Password must be at most 128 characters' };
        }

        return { isValid: true };
    },

    //  FULL NAME VALIDATION
    validateFullName: function(fullName) {
        if (!fullName || fullName.trim() === '') {
            return { isValid: false, error: 'Full name is required' };
        }

        if (fullName.trim().length < 2) {
            return { isValid: false, error: 'Full name must be at least 2 characters' };
        }

        if (fullName.trim().length > 100) {
            return { isValid: false, error: 'Full name must be at most 100 characters' };
        }

        const nameRegex = /^[a-zA-Z\s\-']+$/;
        if (!nameRegex.test(fullName.trim())) {
            return { isValid: false, error: 'Full name can only contain letters, spaces, hyphens, and apostrophes' };
        }

        return { isValid: true, sanitized: fullName.trim() };
    },

    // BIRTHDAY VALIDATION
    validateBirthday: function(birthday) {
        if (!birthday || birthday === '') {
            return { isValid: false, error: 'Birthday is required' };
        }

        const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!birthdayRegex.test(birthday)) {
            return { isValid: false, error: 'Birthday must be in YYYY-MM-DD format' };
        }
        // Check valid date and age limits
        const birthDate = new Date(birthday); 
        const today = new Date(); // Current date

    
        if (isNaN(birthDate.getTime())) { 
            return { isValid: false, error: 'Invalid birthday date' };
        }

        if (birthDate > today) {
            return { isValid: false, error: 'Birthday cannot be in the future' };
        }

        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        if (age < 13 || (age === 13 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
            return { isValid: false, error: 'You must be at least 13 years old' };
        }

        if (age > 150) {
            return { isValid: false, error: 'Invalid birthday' };
        }

        return { isValid: true };
    },

    // FLIGHT NUMBER VALIDATION
    validateFlightNumber: function(flightNumber) {
        if (!flightNumber || flightNumber.trim() === '') {
            return { isValid: false, error: 'Flight number is required' };
        }

        if (flightNumber.trim().length > 10) {
            return { isValid: false, error: 'Flight number is too long' };
        }

        const flightRegex = /^[A-Z]{2,3}\d{1,4}$/i;
        if (!flightRegex.test(flightNumber.trim().toUpperCase())) {
            return { isValid: false, error: 'Invalid flight number format (e.g., AA123)' };
        }

        return { isValid: true, sanitized: flightNumber.trim().toUpperCase() };
    },

    //  AIRPORT VALIDATION
    validateAirportCode: function(code) {
        if (!code || code.trim() === '') {
            return { isValid: false, error: 'Destination is required' };
        }

        const trimmed = code.trim().replace(/\s+/g, ' ');
        if (trimmed.length < 2) {
            return { isValid: false, error: 'Destination must be at least 2 characters' };
        }

        if (trimmed.length > 100) {
            return { isValid: false, error: 'Destination must be at most 100 characters' };
        }

        const nameRegex = /^[a-zA-Z\s\-\.\'’]+$/;
        if (!nameRegex.test(trimmed)) {
            return { isValid: false, error: 'Invalid destination format' };
        }

        const sanitized = trimmed.split(' ').map(word => {
            return word.split('-').map(part => {
                if (part.length === 0) return part;
                return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            }).join('-');
        }).join(' ');

        return { isValid: true, sanitized };
    },

    // DATE & TIME VALIDATION
    validateDate: function(date) {
        if (!date || date === '') {
            return { isValid: false, error: 'Date is required' };
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return { isValid: false, error: 'Date must be in YYYY-MM-DD format' };
        }

        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return { isValid: false, error: 'Invalid date' };
        }

        return { isValid: true };
    },

    validateTime: function(time) {
        if (!time || time === '') {
            return { isValid: false, error: 'Time is required' };
        }

        const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
        if (!timeRegex.test(time)) {
            return { isValid: false, error: 'Time must be in HH:MM format (24-hour)' };
        }

        return { isValid: true };
    },

    // SEAT CAPACITY VALIDATION
    validateSeatCapacity: function(capacity) {
        if (!capacity || capacity === '') {
            return { isValid: false, error: 'Seat capacity is required' };
        }

        const capacityNum = parseInt(capacity, 10);
        if (isNaN(capacityNum)) {
            return { isValid: false, error: 'Seat capacity must be a number' };
        }

        if (capacityNum < 10) {
            return { isValid: false, error: 'Seat capacity must be at least 10' };
        }

        if (capacityNum > 500) {
            return { isValid: false, error: 'Seat capacity cannot exceed 500' };
        }

        return { isValid: true, sanitized: capacityNum };
    },

    // PRICE VALIDATION
    validatePrice: function(price) {
        if (!price || price === '') {
            return { isValid: false, error: 'Price is required' };
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum)) {
            return { isValid: false, error: 'Price must be a valid number' };
        }

        if (priceNum < 0) {
            return { isValid: false, error: 'Price cannot be negative' };
        }

        if (priceNum > 10000) {
            return { isValid: false, error: 'Price cannot exceed 10,000' };
        }

        return { isValid: true, sanitized: priceNum.toFixed(2) };
    },

    // BOOKING DETAILS VALIDATION
    validatePassportId: function(passportId) {
        if (!passportId || passportId.trim() === '') {
            return { isValid: false, error: 'Passport ID is required' };
        }

        if (passportId.trim().length < 5 || passportId.trim().length > 20) {
            return { isValid: false, error: 'Passport ID must be between 5 and 20 characters' };
        }

        const passportRegex = /^[A-Z0-9]{5,20}$/i;
        if (!passportRegex.test(passportId.trim().toUpperCase())) {
            return { isValid: false, error: 'Passport ID can only contain letters and numbers' };
        }

        return { isValid: true, sanitized: passportId.trim().toUpperCase() };
    },

    validateSeat: function(seat) {
        if (!seat || seat.trim() === '') {
            return { isValid: false, error: 'Seat selection is required' };
        }

        const seatRegex = /^([1-9]|[1-9]\d|[1-9]\d{2})[A-F]$/i;
        if (!seatRegex.test(seat.trim().toUpperCase())) {
            return { isValid: false, error: 'Invalid seat format' };
        }

        return { isValid: true, sanitized: seat.trim().toUpperCase() };
    },

    validateMealOption: function(meal) {
        // Keep client meal options in sync with the reservation form template
        const validMeals = ['Standard', 'Vegetarian', "Religious", "Medical", "Children's Meal", 'Gluten-Free', 'Halal', 'Kosher'];

        return { isValid: true, sanitized: meal.trim() };
    },

    validateExtraBaggage: function(baggage) {
        if (!baggage || baggage === '') {
            return { isValid: true, sanitized: 0 };
        }

        const baggageNum = parseInt(baggage, 10);
        
        if (baggageNum < 0) {
            return { isValid: false, error: 'Extra baggage cannot be negative' };
        }


        return { isValid: true, sanitized: baggageNum };
    },

    // display validation error to user
    showError: function(elementId, errorMessage) { 
        const element = document.getElementById(elementId); 
        if (!element) return;

        // Remove previous error
        this.clearError(elementId);

        // Add error class to input
        element.classList.add('is-invalid');

        // Create and insert error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback d-block';
        errorDiv.textContent = errorMessage;
        element.parentNode.insertBefore(errorDiv, element.nextSibling);
    },

    // clear validation error from user
    clearError: function(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.classList.remove('is-invalid');

        // Remove error message
        const errorDiv = element.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    },

    // clear all validation errors
    clearAllErrors: function() {
        const invalidElements = document.querySelectorAll('.is-invalid');
        invalidElements.forEach(el => {
            el.classList.remove('is-invalid');
            const errorDiv = el.parentNode.querySelector('.invalid-feedback');
            if (errorDiv) {
                errorDiv.remove();
            }
        });
    },

    // validate entire form and return all errors
    validateForm: function(validationRules) {
        this.clearAllErrors();
        const errors = {};
        let hasErrors = false;

        for (const [fieldId, rules] of Object.entries(validationRules)) {
            const element = document.getElementById(fieldId);
            if (!element) continue;

            const value = element.value;
            const validator = rules.validator;
            const result = validator(value);

            if (!result.isValid) {
                this.showError(fieldId, result.error);
                errors[fieldId] = result.error;
                hasErrors = true;
            }
        }

        return {
            isValid: !hasErrors,
            errors: errors
        };
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.ClientValidation = ClientValidation;
}
