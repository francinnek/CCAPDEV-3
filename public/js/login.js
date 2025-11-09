document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerBtn = document.getElementById('registerBtn');
    const formMessage = document.getElementById('formMessage');

    // Handle register button click
    registerBtn.addEventListener('click', function() {
        window.location.href = '/register'; // Uses server route
    });

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };

        // Show loading state
        formMessage.innerHTML = '<div class="alert alert-info">Logging in...</div>';

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                formMessage.innerHTML = '<div class="alert alert-success">Login successful! Redirecting...</div>';
                setTimeout(() => {
                    window.location.href = '/admin'; // Uses server route
                }, 1500);
            } else {
                formMessage.innerHTML = `<div class="alert alert-danger">${result.message || 'Login failed'}</div>`;
            }
        } catch (error) {
            formMessage.innerHTML = '<div class="alert alert-danger">Network error. Please try again.</div>';
            console.error('Login error:', error);
        }
    });
});