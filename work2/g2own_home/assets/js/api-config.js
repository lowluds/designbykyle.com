/*!
 * G2Own API Configuration
 * Handles communication with Invision Community backend
 */

class G2OwnAPI {
    constructor() {
        this.baseURL = '#/community/api';
        this.endpoints = {
            auth: '/core/me',
            login: '/core/members/login',
            register: '/core/members/register',
            profile: '/core/members/{id}',
            content: '/core/items',
            search: '/core/search',
            logout: '/core/logout'
        };
        this.token = localStorage.getItem('ic_token');
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include' // Important for cross-domain cookies
        };

        // Add authorization header if token exists
        if (this.token) {
            defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            // Handle different response types
            if (response.status === 401) {
                // Token expired or invalid
                this.clearAuth();
                throw new Error('Authentication required');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async getCurrentUser() {
        try {
            if (!this.token) {
                return null;
            }
            
            const response = await this.makeRequest(this.endpoints.auth);
            if (response && response.id) {
                localStorage.setItem('ic_user', JSON.stringify(response));
                return response;
            }
            return null;
        } catch (error) {
            console.error('Get current user failed:', error);
            this.clearAuth();
            return null;
        }
    }

    async login(email, password) {
        try {
            const response = await this.makeRequest(this.endpoints.login, {
                method: 'POST',
                body: JSON.stringify({ 
                    email: email, 
                    password: password 
                })
            });
            
            if (response && response.token) {
                this.token = response.token;
                localStorage.setItem('ic_token', response.token);
                localStorage.setItem('ic_user', JSON.stringify(response.user || response));
                return response;
            }
            
            throw new Error('Invalid login response');
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async logout() {
        try {
            await this.makeRequest(this.endpoints.logout, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            this.clearAuth();
        }
    }

    clearAuth() {
        this.token = null;
        localStorage.removeItem('ic_token');
        localStorage.removeItem('ic_user');
    }

    // Helper methods
    getStoredUser() {
        try {
            const userStr = localStorage.getItem('ic_user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Failed to parse stored user:', error);
            return null;
        }
    }    isAuthenticated() {
        return !!this.token && !!this.getStoredUser();
    }

    async checkAuth() {
        if (!this.token) {
            return false;
        }

        try {
            const user = await this.makeRequest(this.endpoints.auth);
            if (user && user.id) {
                // Update stored user data
                localStorage.setItem('ic_user', JSON.stringify(user));
                return true;
            }
        } catch (error) {
            console.warn('Auth check failed:', error);
            this.clearAuth();
        }
        
        return false;
    }

    // Content methods (for future use)
    async searchContent(query) {
        return this.makeRequest(`${this.endpoints.search}?q=${encodeURIComponent(query)}`);
    }

    async getProfile(userId) {
        const endpoint = this.endpoints.profile.replace('{id}', userId);
        return this.makeRequest(endpoint);
    }
}

// Initialize API instance globally
window.g2ownAPI = new G2OwnAPI();

// Debug helper
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugAPI = window.g2ownAPI;
    console.log('G2Own API initialized in debug mode');
}
