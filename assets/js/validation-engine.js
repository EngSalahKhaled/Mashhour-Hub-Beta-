/**
 * Mashhor Hub Professional Validation Engine
 * Handles Name, Email, and Strong Password policies
 */

const ValidationEngine = {
    validateName: (name) => {
        const re = /^[\u0600-\u06FFa-zA-Z\s]{3,50}$/;
        return re.test(name);
    },

    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePassword: (password) => {
        // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return re.test(password);
    },

    getPasswordStrength: (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[@$!%*?&]/.test(password)) strength++;
        return strength; // 0 to 5
    },

    showError: (inputEl, message) => {
        inputEl.style.borderColor = '#ef4444';
        let errorEl = inputEl.parentElement.querySelector('.error-msg');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'error-msg';
            errorEl.style.color = '#ef4444';
            errorEl.style.fontSize = '0.75rem';
            errorEl.style.marginTop = '5px';
            inputEl.parentElement.appendChild(errorEl);
        }
        errorEl.innerText = message;
    },

    clearError: (inputEl) => {
        inputEl.style.borderColor = 'rgba(255,255,255,0.1)';
        const errorEl = inputEl.parentElement.querySelector('.error-msg');
        if (errorEl) errorEl.remove();
    }
};

window.ValidationEngine = ValidationEngine;
