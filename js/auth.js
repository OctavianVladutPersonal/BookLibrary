/**
 * Authentication Functions
 * Handles user login, signup, and logout
 */

async function handleSignUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    StatusManager.clearStatus(DOM.authError);

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log("User signed up:", userCredential.user.email);
    } catch (error) {
        console.error("Sign up error:", error);
        StatusManager.showError(DOM.authError, "Sign up failed: " + error.message);
    }
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    StatusManager.clearStatus(DOM.authError);

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log("User logged in:", userCredential.user.email);
    } catch (error) {
        console.error("Login error:", error);
        StatusManager.updateStatus(DOM.authError, error.message);
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        console.log("User logged out.");
    } catch (error) {
        console.error("Logout error:", error);
    }
}

function setupAuthStateListener(onAuthChanged) {
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("Auth state: LOGGED IN", user.email);
            DOM.authStatus.classList.remove('hidden');
            DOM.userEmailDisplay.textContent = `Logged in as: ${user.email}`;
            DOM.authContainer.classList.add('hidden');
            StatusManager.clearStatus(DOM.authError);
            DOM.addBookSection.classList.remove('hidden');
        } else {
            console.log("Auth state: LOGGED OUT");
            DOM.authStatus.classList.add('hidden');
            DOM.userEmailDisplay.textContent = '';
            DOM.authContainer.classList.remove('hidden');
            DOM.addBookSection.classList.add('hidden');
            DOM.editBookSection.classList.add('hidden');
        }

        if (onAuthChanged) {
            onAuthChanged(user);
        }
    });
}
