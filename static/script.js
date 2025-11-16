const signupForm = document.getElementById("signup-form")
const loginForm = document.getElementById("login-form")
const profileForm = document.getElementById("profile-form")
const passwordForm = document.getElementById("password-form")
const logoutBtn = document.getElementById("log-out-btn")
const loginBtn = document.getElementById("login-btn")
const signupBtn = document.getElementById("signup-link")


if (loginBtn){
    loginBtn.addEventListener("click", ()=> {
        window.location.href = "/user_login";
    })
}


if (passwordForm) {
    passwordForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const currentPassword = passwordForm.querySelector("#current-password")
        const newPassword = passwordForm.querySelector("#new-password")
        const confirmPassword = passwordForm.querySelector("#confirm-password")

        const updatePassword = {
            current_password: currentPassword.value,
            new_password: newPassword.value,
            confirm_password: confirmPassword.value
        }

        try {
            const passwordResp = await fetch ("/update_password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatePassword)
            })

            const updatePasswordResult = await passwordResp.json();

            if (updatePasswordResult.success) {
                showToast(updatePasswordResult.message);
            } else {
                showToast(updatePasswordResult.message);
            }
        } catch(error) {
            console.error("Password update error:", error);
        }
    })
}

if (profileForm) {
    profileForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const fullname = profileForm.querySelector("#full-name")
        const username = profileForm.querySelector("#username")
        const email = profileForm.querySelector("#email")

        const updateInfo = {
            full_name: fullname.value.trim(),
            username: username.value.trim(),
            email: email.value.trim()
        }

        try {
            const profileResp = await fetch ("/update_profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updateInfo)
            })

            const updateProfileResult = await profileResp.json();

            if (updateProfileResult.success) {
                showToast(updateProfileResult.message);
            } else {
                showToast(updateProfileResult.message);
            }
        } catch(error) {
            console.error("Profile update error:", error);
        }

    })
}

if (signupForm) {
    signupForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        console.log("signupForm:", signupForm);
        const fullname = signupForm.querySelector("#full-name")
        if (!fullname) {
            console.error("Missing full-name input!");
            return;
        }
        const username = signupForm.querySelector("#username")
        const email = signupForm.querySelector("#email")
        const password = signupForm.querySelector("#password")

        const info = {
            full_name: fullname.value.trim(),
            username: username.value.trim(),
            email: email.value.trim(),
            password: password.value
        }

        try {
            const signupResp = await fetch ("/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(info)
            })

            const signupResult = await signupResp.json();

            if (signupResult.success) {
                showToast(signupResult.message);
                setTimeout(() => {
                    window.location.href = "/index";
                }, 1500);
            } else {
                showToast(signupResult.message);
            }
        } catch(error) {
            console.error("Signup error:", error);
        }

    })
}

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const password = loginForm.querySelector("#password")
        const loginID = loginForm.querySelector("#login-id")

        const loginInfo = {
            login_id: loginID.value.trim(),
            password: password.value
        }

        try {
            const loginResp = await fetch ("/post_login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginInfo)
            })

            const loginResult = await loginResp.json();

            if (loginResult.success) {
                showToast(loginResult.message);
                setTimeout(() => {
                    window.location.href = "/index";
                }, 1500);
            } else {
                showToast(loginResult.message);
            }
        } catch(error) {
            console.error("Login error:", error);
        }

    })
}

if (signupBtn){
    signupBtn.addEventListener("click", ()=> {
        window.location.href = "/";
    })
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {

        // Create pop-up
        const popup = document.createElement("div");
        Object.assign(popup.style, {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            padding: "20px 25px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            textAlign: "center",
            zIndex: "9999",
        });

        popup.innerHTML = `
            <p style="margin-bottom: 20px; font-weight:500;">Are you sure you want to log out?</p>
            <button id="confirm-logout" style="margin-right:10px; padding:8px 15px; background:#ec7fb1; color:#fff; border:none; border-radius:8px; cursor:pointer;">Yes</button>
            <button id="cancel-logout" style="padding:8px 15px; background:#ccc; color:#333; border:none; border-radius:8px; cursor:pointer;">No</button>
        `;

        document.body.appendChild(popup);

        // Confirm button
        popup.querySelector("#confirm-logout").addEventListener("click", () => {
            window.location.href = "/logout";
        });

        // Cancel button
        popup.querySelector("#cancel-logout").addEventListener("click", () => {
            if (document.body.contains(popup)) {
                document.body.removeChild(popup);
            }
        });
    });
}


function showToast(message, duration = 2000) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    Object.assign(toast.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%) translateY(-20px)",
        background: "#ec7fb1",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "10px",
        fontWeight: "500",
        opacity: "0",
        transition: "all 0.3s ease",
        zIndex: "9999",
    });

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translate(-50%, -50%) translateY(0)";
    }, 100);

    // Animate out
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translate(-50%, -50%) translateY(20px)";
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, duration);
}
