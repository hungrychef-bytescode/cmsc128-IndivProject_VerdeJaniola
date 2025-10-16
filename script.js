// ============================================
// DATABASE SETUP
// ============================================

// In-memory database simulation
// This object stores all user data and the current logged-in user
// Note: Data is lost on page refresh since it's stored in memory
const database = {
    users: [],          // Array to store all registered users
    currentUser: null   // Currently logged-in user object
};

// Temporary storage for email during password reset flow
let resetEmail = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Shows a specific page and hides all others
 * @param {string} pageId - The ID of the page element to display
 */
function showPage(pageId) {
    // Hide all pages by removing the 'active' class
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    // Show the requested page by adding the 'active' class
    document.getElementById(pageId).classList.add('active');
    // Clear any existing messages when switching pages
    clearMessages();
}

/**
 * Displays a message to the user (success or error)
 * @param {string} elementId - The ID of the element where the message will be displayed
 * @param {string} message - The message text to display
 * @param {boolean} isError - Whether this is an error message (default: false)
 */
function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    // Create a styled message div with appropriate class (error or success)
    element.innerHTML = `<div class="message ${isError ? 'error' : 'success'}">${message}</div>`;
}

/**
 * Clears all message displays on the page
 * Finds all elements with IDs ending in "Message" and clears their content
 */
function clearMessages() {
    document.querySelectorAll('[id$="Message"]').forEach(el => el.innerHTML = '');
}

/**
 * Logs out the current user and returns to login page
 */
function logout() {
    // Clear the current user from memory
    database.currentUser = null;
    // Navigate back to login page
    showPage('loginPage');
}

/**
 * Loads the current user's profile data into the profile page
 * Updates profile display and form fields with user information
 */
function loadProfile() {
    // Exit if no user is logged in
    if (!database.currentUser) return;

    const user = database.currentUser;
    // Display user's initial (first letter of name) in the profile icon
    document.getElementById('profileIcon').textContent = user.name.charAt(0).toUpperCase();
    // Display user's full name
    document.getElementById('profileName').textContent = user.name;
    // Display user's email
    document.getElementById('profileEmail').textContent = user.email;
    // Pre-fill the profile form with current values
    document.getElementById('profileNameInput').value = user.name;
    document.getElementById('profileUsernameInput').value = user.username;
    // Clear the password field (we don't show existing password)
    document.getElementById('profilePasswordInput').value = '';
}

// ============================================
// USER SEARCH FUNCTIONS
// ============================================

/**
 * Finds a user by email address (case-insensitive)
 * @param {string} email - The email address to search for
 * @returns {Object|undefined} User object if found, undefined otherwise
 */
function findUserByEmail(email) {
    return database.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Finds a user by username (case-insensitive)
 * @param {string} username - The username to search for
 * @returns {Object|undefined} User object if found, undefined otherwise
 */
function findUserByUsername(username) {
    return database.users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

/**
 * Finds a user by either email or username (case-insensitive)
 * Used for login where users can enter either credential
 * @param {string} identifier - The email or username to search for
 * @returns {Object|undefined} User object if found, undefined otherwise
 */
function findUserByEmailOrUsername(identifier) {
    const lower = identifier.toLowerCase();
    return database.users.find(u => 
        u.email.toLowerCase() === lower || 
        u.username.toLowerCase() === lower
    );
}

// ============================================
// FORM EVENT HANDLERS
// ============================================

/**
 * SIGN UP FORM HANDLER
 * Handles new user registration
 * Validates that email and username are unique before creating account
 */
document.getElementById('signupForm').addEventListener('submit', (e) => {
    // Prevent default form submission (page reload)
    e.preventDefault();
    clearMessages();

    // Get form values and trim whitespace
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;

    // Validation: Check if email already exists
    if (findUserByEmail(email)) {
        showMessage('signupMessage', 'Email already exists', true);
        return;
    }

    // Validation: Check if username already exists
    if (findUserByUsername(username)) {
        showMessage('signupMessage', 'Username already exists', true);
        return;
    }

    // Create new user object with all required fields
    const user = {
        id: Date.now().toString(),          // Generate unique ID using timestamp
        name,
        email,
        username,
        password,
        createdAt: new Date().toISOString() // Store account creation timestamp
    };

    // Add user to database
    database.users.push(user);
    
    // Show success message
    showMessage('signupMessage', 'Account created successfully! Redirecting to login...');
    
    // Redirect to login page after 1.5 seconds
    setTimeout(() => {
        document.getElementById('signupForm').reset(); // Clear form fields
        showPage('loginPage');
    }, 1500);
});

/**
 * LOGIN FORM HANDLER
 * Authenticates user with username/email and password
 * On success, loads user profile page
 */
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();

    // Get login credentials
    const identifier = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Find user by email or username
    const user = findUserByEmailOrUsername(identifier);

    // Validation: Check if user exists
    if (!user) {
        showMessage('loginMessage', 'User not found', true);
        return;
    }

    // Validation: Check if password matches
    if (user.password !== password) {
        showMessage('loginMessage', 'Incorrect password', true);
        return;
    }

    // Login successful - set current user and navigate to profile
    database.currentUser = user;
    loadProfile();                              // Load user data into profile page
    showPage('profilePage');                    // Navigate to profile page
    document.getElementById('loginForm').reset(); // Clear login form
});

/**
 * PROFILE UPDATE FORM HANDLER
 * Allows logged-in users to update their profile information
 * Validates username availability before updating
 */
document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();

    // Get updated profile data
    const name = document.getElementById('profileNameInput').value.trim();
    const username = document.getElementById('profileUsernameInput').value.trim();
    const password = document.getElementById('profilePasswordInput').value;

    // Check if new username is already taken by another user
    const existingUser = findUserByUsername(username);
    if (existingUser && existingUser.id !== database.currentUser.id) {
        showMessage('profileMessage', 'Username already taken', true);
        return;
    }

    // Update user data
    database.currentUser.name = name;
    database.currentUser.username = username;
    
    // Only update password if a new one was provided
    if (password) {
        database.currentUser.password = password;
    }

    // Reload profile display with updated data
    loadProfile();
    showMessage('profileMessage', 'Profile updated successfully!');
    
    // Clear password field after update
    document.getElementById('profilePasswordInput').value = '';
});

/**
 * FORGOT PASSWORD FORM HANDLER
 * Initiates password reset process
 * Verifies email exists before allowing reset
 */
document.getElementById('forgotForm').addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();

    // Get email address for password reset
    const email = document.getElementById('forgotEmail').value.trim();
    const user = findUserByEmail(email);

    // Validation: Check if account with this email exists
    if (!user) {
        showMessage('forgotMessage', 'No account found with that email', true);
        return;
    }

    // Store email for use in reset password page
    resetEmail = email;
    showMessage('forgotMessage', 'Email verified! Redirecting...');
    
    // Navigate to password reset page after verification
    setTimeout(() => {
        document.getElementById('forgotForm').reset();
        showPage('resetPage');
    }, 1500);
});

/**
 * RESET PASSWORD FORM HANDLER
 * Completes password reset process
 * Validates password confirmation match and updates password
 */
document.getElementById('resetForm').addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();

    // Get new password and confirmation
    const password = document.getElementById('resetPassword').value;
    const confirmPassword = document.getElementById('resetPasswordConfirm').value;

    // Validation: Check if passwords match
    if (password !== confirmPassword) {
        showMessage('resetMessage', 'Passwords do not match', true);
        return;
    }

    // Find user and update password
    const user = findUserByEmail(resetEmail);
    if (user) {
        user.password = password; // Update password in database
        showMessage('resetMessage', 'Password reset successfully! Redirecting to login...');
        
        // Clean up and redirect to login
        setTimeout(() => {
            document.getElementById('resetForm').reset();
            resetEmail = null; // Clear stored email
            showPage('loginPage');
        }, 1500);
    }
});