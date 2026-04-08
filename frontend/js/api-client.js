// API Client for Django Backend
class ApiClient {
    constructor() {
        // Auto-detect backend URL
        const hostname = window.location.hostname;
        if (hostname === 'skillswap-frontend-bmxn.onrender.com') {
            this.baseURL = 'https://skillswap-backend-iiz3.onrender.com/api';
        } else {
            this.baseURL = 'http://localhost:8000/api';
        }
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    async request(endpoint, options = {}) {
        const res = await fetch(this.baseURL + endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` }),
            },
            ...options,
        });

        let data;

        try {
            data = await res.json(); // ✅ read ONLY ONCE
        } catch (e) {
            data = null;
        }

        if (!res.ok) {
            throw new Error(data?.detail || 'API request failed');
        }

        return data;
    }

    // Auth endpoints
    async signup(name, email, password) {
        return this.request('/auth/signup/', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    }

    async login(email, password) {
        return this.request('/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async getMe() {
        return this.request('/auth/me/');
    }

    // User endpoints
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/users/${queryString ? '?' + queryString : ''}`);
    }

    async getUserById(id) {
        return this.request(`/users/${id}/`);
    }

    async updateProfile(data) {
        return this.request('/users/me/profile/', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async addSkillOffered(skill) {
        return this.request('/users/me/skills/offered/', {
            method: 'POST',
            body: JSON.stringify({ skill }),
        });
    }

    async removeSkillOffered(skill) {
        return this.request('/users/me/skills/offered/', {
            method: 'DELETE',
            body: JSON.stringify({ skill }),
        });
    }

    async addSkillWanted(skill) {
        return this.request('/users/me/skills/wanted/', {
            method: 'POST',
            body: JSON.stringify({ skill }),
        });
    }

    async removeSkillWanted(skill) {
        return this.request('/users/me/skills/wanted/', {
            method: 'DELETE',
            body: JSON.stringify({ skill }),
        });
    }

    // Request endpoints
    async getRequests(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/requests/${queryString ? '?' + queryString : ''}`);
    }

    async createRequest(receiverId, skillOffered, skillRequested, message) {
        return this.request('/requests/', {
            method: 'POST',
            body: JSON.stringify({
                receiver_id: receiverId,
                skill_offered: skillOffered,
                skill_requested: skillRequested,
                message,
            }),
        });
    }

    async acceptRequest(id) {
        return this.request(`/requests/${id}/accept/`, {
            method: 'PUT',
        });
    }

    async rejectRequest(id) {
        return this.request(`/requests/${id}/reject/`, {
            method: 'PUT',
        });
    }

    async completeRequest(id) {
        return this.request(`/requests/${id}/complete/`, {
            method: 'PUT',
        });
    }

    async deleteRequest(id) {
        return this.request(`/requests/${id}/`, {
            method: 'DELETE',
        });
    }

    async updateMilestone(id, milestone) {
        return this.request(`/requests/${id}/milestone/`, {
            method: 'PUT',
            body: JSON.stringify({ milestone })
        });
    }

    async getSwapMessages(id) {
        return this.request(`/requests/${id}/messages/`, {
            method: 'GET'
        });
    }

    async sendSwapMessage(id, text) {
        return this.request(`/requests/${id}/messages/`, {
            method: 'POST',
            body: JSON.stringify({ text })
        });
    }

    async addReview(userId, rating, text) {
        return this.request(`/users/${userId}/review/`, {
            method: 'POST',
            body: JSON.stringify({ rating, text })
        });
    }

    // Notification endpoints
    async getNotifications() {
        return this.request('/notifications/');
    }

    async markNotificationRead(id) {
        return this.request(`/notifications/${id}/read/`, {
            method: 'PUT',
        });
    }

    async markAllNotificationsRead() {
        return this.request('/notifications/read-all/', {
            method: 'PUT',
        });
    }

    // Admin endpoints
    async getAdminStats() {
        return this.request('/admin/stats/');
    }

    async getAdminUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/admin/users/${queryString ? '?' + queryString : ''}`);
    }

    async createAdminUser({ name, email, password, role = 'user' }) {
        return this.request('/admin/users/', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role }),
        });
    }

    async blockUser(id) {
        return this.request(`/admin/users/${id}/block/`, {
            method: 'PUT',
        });
    }

    async unblockUser(id) {
        return this.request(`/admin/users/${id}/unblock/`, {
            method: 'PUT',
        });
    }

    async deleteUser(id) {
        return this.request(`/admin/users/${id}/`, {
            method: 'DELETE',
        });
    }
}

// Global API client instance
window.apiClient = new ApiClient();
