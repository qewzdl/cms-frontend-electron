import { Config } from '../config.js';

export class AuthService {
    constructor(baseUrl = Config.apiBaseUrl) {
      this.baseUrl = baseUrl;
    }
    /**
     * @param {string} endpoint 
     * @param {object} options
     */
    async request(endpoint, options = {}) {
      const token = localStorage.getItem('access_token');
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
      let res = await fetch(`${this.baseUrl}${endpoint}`, options);
      if (res.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          options.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
          res = await fetch(`${this.baseUrl}${endpoint}`, options);
        } else {
          window.location.href = 'login.html';
          throw new Error('Session expired');
        }
      }
      return res;
    }
  
    get(endpoint, options) {
      return this.request(endpoint, { ...options, method: 'GET' });
    }
  
    post(endpoint, body, options = {}) {
      const headers = { 'Content-Type': 'application/json', ...options.headers };
      return this.request(endpoint, {
        ...options,
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
    }

    patch(endpoint, body, options = {}) {
      const headers = { 'Content-Type': 'application/json', ...options.headers };
      return this.request(endpoint, {
        ...options,
        method: 'PATCH',
        headers,
        body: JSON.stringify(body)
      });
    }

    delete(endpoint, options = {}) {
      return this.request(endpoint, { ...options, method: 'DELETE' });
    }
  
    postForm(endpoint, formData) {
      return this.request(endpoint, {
        method: 'POST',
        body: formData
      });
    }
  
    async refreshToken() {
      const refreshToken = localStorage.getItem('refresh_token');
      const res = await fetch(this.baseUrl + Config.endpoints.refreshToken, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${refreshToken}` }
      });
      if (res.ok) {
        const tokens = await res.json();
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        return true;
      }
      localStorage.clear();
      return false;
    }
  }
  