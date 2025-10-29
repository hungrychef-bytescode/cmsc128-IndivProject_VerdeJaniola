// ============================================
// FRONTEND LOGIC CONNECTED TO FLASK BACKEND
// ============================================

let currentUser = null; // stores the currently logged-in user info

// ============================================
// PAGE DISPLAY & MESSAGE HELPERS
// ============================================

function showPage(pageId) {
    // hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    // show selected page
    document.getElementById(pageId).classList.add('active');
    clearMessages(); // clear previous messages
}

function showMessage(elementId, message, isError = false) {
    // show a success or error message in the target element
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="message ${isError ? 'error' : 'success'}">${message}</div>`;
}

function clearMessages() {
    // clear all elements ending with "Message"
    document.querySelectorAll('[id$="Message"]').forEach(el => el.innerHTML = '');
}

// ============================================
// SIGN UP
// ============================================
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent page reload
    clearMessages();

    // get user input values
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;

    try {
        // send signup data to Flask backend
        const res = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, username, password })
        });
        const data = await res.json();

        if (data.success) {
            // show success then go to login page
            showMessage('signupMessage', data.message);
            setTimeout(() => {
                document.getElementById('signupForm').reset();
                window.location.href = `/profile.html/${data.user.id}`;
;
            }, 1500);
        } else {
            // show error message
            showMessage('signupMessage', data.message, true);
        }
    } catch (err) {
        showMessage('signupMessage', 'Error connecting to server', true);
    }
});

// ============================================
// LOGIN
// ============================================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent form reload
    clearMessages();

    const identifier = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        // send login data to Flask backend
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });
        const data = await res.json();

        if (data.success) {
            // store user info and show profile
            currentUser = data.user;
            loadProfile();
            window.location.href = `/profile.html/${currentUser.id}`;
            document.getElementById('loginForm').reset();
        } else {
            showMessage('loginMessage', data.message, true);
        }
    } catch (err) {
        showMessage('loginMessage', 'Error connecting to server', true);
    }
});

// ============================================
// LOAD PROFILE
// ============================================
function loadProfile() {
    if (!currentUser) return;
    // fill profile section with current user data
    document.getElementById('profileIcon').textContent = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileNameInput').value = currentUser.name;
    document.getElementById('profileUsernameInput').value = currentUser.username;
    document.getElementById('profilePasswordInput').value = '';
}

// ============================================
// UPDATE PROFILE
// ============================================
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // prevent reload
    clearMessages();

    // get updated values
    const name = document.getElementById('profileNameInput').value.trim();
    const username = document.getElementById('profileUsernameInput').value.trim();
    const password = document.getElementById('profilePasswordInput').value;

    try {
        // send updated profile data to Flask
        const res = await fetch('/update_profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentUser.id, name, username, password })
        });
        const data = await res.json();

        if (data.success) {
            // update UI and show success message
            currentUser.name = name;
            currentUser.username = username;
            if (password) currentUser.password = password;
            loadProfile();
            showMessage('profileMessage', data.message);
        } else {
            showMessage('profileMessage', data.message, true);
        }
    } catch (err) {
        showMessage('profileMessage', 'Error connecting to server', true);
    }
});

// ============================================
// LOGOUT
// ============================================
function logout() {
    // clear user data and return to login page
    currentUser = null;
    showPage('loginPage');
}