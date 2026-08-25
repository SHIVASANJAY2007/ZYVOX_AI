import { BACKEND_API_URL } from '../config';

/**
 * Checks if an email is already registered in the PostgreSQL database.
 * @param {string} email 
 * @returns {Promise<{success: boolean, exists: boolean, message?: string}>}
 */
export async function checkEmail(email) {
    if (!BACKEND_API_URL) {
        throw new Error('VITE_BACKEND_API_URL is not configured.');
    }

    const url = `${BACKEND_API_URL}/api/auth/check-email?email=${encodeURIComponent(email)}`;
    const response = await fetch(url, {
        method: 'GET'
    });

    if (!response.ok) {
        const text = await response.text();
        let errorMsg = 'Failed to check email availability.';
        try {
            const errJson = JSON.parse(text);
            errorMsg = errJson.message || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
    }

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error(`Failed to parse email check response: ${text}`);
    }
}

/**
 * Submits a new user registration to the PostgreSQL database.
 * @param {object} userData
 * @param {string} userData.name
 * @param {string} userData.phone
 * @param {string} userData.email
 * @param {string} userData.password
 * @returns {Promise<{success: boolean, message: string, user?: object}>}
 */
export async function signup({ name, phone, email, password }) {
    if (!BACKEND_API_URL) {
        throw new Error('VITE_BACKEND_API_URL is not configured.');
    }

    const payload = {
        name,
        phone,
        email,
        password
    };

    const response = await fetch(`${BACKEND_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const text = await response.text();
        let errorMsg = 'Failed to connect to registration server.';
        try {
            const errJson = JSON.parse(text);
            errorMsg = errJson.message || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
    }

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error(`Failed to parse signup response: ${text}`);
    }
}

/**
 * Authenticates a user using email and password against the PostgreSQL database.
 * @param {object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<{success: boolean, message: string, user?: {personNo: string, name: string, phone: string, email: string}}>}
 */
export async function login({ email, password }) {
    if (!BACKEND_API_URL) {
        throw new Error('VITE_BACKEND_API_URL is not configured.');
    }

    const payload = {
        email,
        password
    };

    const response = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const text = await response.text();
        let errorMsg = 'Invalid email or password.';
        try {
            const errJson = JSON.parse(text);
            errorMsg = errJson.message || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
    }

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error(`Failed to parse login response: ${text}`);
    }
}

