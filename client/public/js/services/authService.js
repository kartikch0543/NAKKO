/**
 * NAKKO Platform - Authentication Service
 * Manages user credentials, registration, session persistence, and role resolution.
 */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./apiClient'));
  } else {
    root.authService = factory(root.apiClient);
  }
})(typeof self !== 'undefined' ? self : this, function(api) {
  'use strict';

  const USER_KEY = 'nakko-user';

  function getStoredUser() {
    try {
      const u = localStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  }

  function setStoredUser(user) {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch (e) {}
  }

  async function login({ email, password, role }) {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const res = await api.post('/auth/login', { email, password, role });
    if (res.token) {
      api.setToken(res.token);
    }
    if (res.user) {
      setStoredUser(res.user);
    }
    return res;
  }

  async function register(userData) {
    const { firstName, email, password } = userData;
    if (!firstName || !email || !password) {
      throw new Error('First name, email, and password are required');
    }

    const res = await api.post('/auth/register', userData);
    if (res.token) {
      api.setToken(res.token);
    }
    if (res.user) {
      setStoredUser(res.user);
    }
    return res;
  }

  async function getCurrentUser() {
    try {
      const res = await api.get('/auth/me');
      if (res && res.user) {
        setStoredUser(res.user);
        return res.user;
      }
    } catch (e) {
      // Fallback to locally cached user
    }
    return getStoredUser();
  }

  function logout() {
    api.setToken(null);
    setStoredUser(null);
    window.location.href = '/login';
  }

  function isAuthenticated() {
    return Boolean(api.getToken() || getStoredUser());
  }

  return {
    login,
    register,
    getCurrentUser,
    getStoredUser,
    setStoredUser,
    logout,
    isAuthenticated
  };
});
