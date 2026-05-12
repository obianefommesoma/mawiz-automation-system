document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const roleOptions = document.querySelectorAll('.role-option');
    const roleInput = document.getElementById('roleInput');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Whitelisted Admin Emails
    const adminWhitelist = ['obianefommesoma8@gmail.com'];

    // Load users from mock cloud (localStorage)
    const getUsers = () => JSON.parse(localStorage.getItem('mawizUsers')) || [];
    const saveUser = (user) => {
        const users = getUsers();
        users.push(user);
        localStorage.setItem('mawizUsers', JSON.stringify(users));
    };

    // Password Visibility Toggle
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('change', () => {
            passwordInput.type = togglePassword.checked ? 'text' : 'password';
        });
    }

    // Role Selection Handling
    if (roleOptions) {
        roleOptions.forEach(option => {
            option.addEventListener('click', () => {
                roleOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                roleInput.value = option.dataset.role;
            });
        });
    }

    // Signup Logic
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value.toLowerCase();
            const password = document.getElementById('password').value;
            const role = roleInput.value;

            // Admin Restriction Logic
            if (role === 'admin' && !adminWhitelist.includes(email)) {
                alert('Access Denied: Only authorized emails can register as Admin.\nPlease contact the system owner.');
                return;
            }

            const users = getUsers();
            if (users.find(u => u.email === email)) {
                alert('Email already registered!');
                return;
            }

            const newUser = { fullName, email, password, role };
            saveUser(newUser);
            
            // Auto-login after signup
            sessionStorage.setItem('mawizSession', JSON.stringify(newUser));
            alert('Account created successfully!');
            window.location.href = 'index.html';
        });
    }

    // Login Logic
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.toLowerCase();
            const password = document.getElementById('password').value;

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                sessionStorage.setItem('mawizSession', JSON.stringify(user));
                window.location.href = 'index.html';
            } else {
                alert('Invalid email or password!');
            }
        });
    }
});
