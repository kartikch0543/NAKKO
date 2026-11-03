/**
 * NAKKO Platform - Centralized Frontend API Client
 * Encapsulates HTTP communication, auth headers, and response normalization.
 */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.apiClient = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // Base URL can be configured dynamically via window.__NAKKO_CONFIG__ or defaults to current origin /api
  const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.__NAKKO_CONFIG__ && window.__NAKKO_CONFIG__.API_BASE_URL) {
      return window.__NAKKO_CONFIG__.API_BASE_URL.replace(/\/$/, '');
    }
    return '/api';
  };

  const getToken = () => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem('nakko-token') : null;
    } catch (e) {
      return null;
    }
  };

  const setToken = (token) => {
    try {
      if (typeof localStorage !== 'undefined') {
        if (token) localStorage.setItem('nakko-token', token);
        else localStorage.removeItem('nakko-token');
      }
    } catch (e) {}
  };

  async function request(endpoint, options = {}) {
    const baseUrl = getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // If endpoint already starts with /api and baseUrl ends with /api, normalize:
    const url = baseUrl.endsWith('/api') && cleanEndpoint.startsWith('/api')
      ? `${baseUrl.slice(0, -4)}${cleanEndpoint}`
      : `${baseUrl}${cleanEndpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error = new Error((data && data.message) || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      console.warn(`[NAKKO API Error] ${config.method || 'GET'} ${url}:`, err.message);
      throw err;
    }
  }

  return {
    getBaseUrl,
    getToken,
    setToken,
    get: (endpoint, headers) => request(endpoint, { method: 'GET', headers }),
    post: (endpoint, body, headers) => request(endpoint, { method: 'POST', body, headers }),
    put: (endpoint, body, headers) => request(endpoint, { method: 'PUT', body, headers }),
    patch: (endpoint, body, headers) => request(endpoint, { method: 'PATCH', body, headers }),
    delete: (endpoint, headers) => request(endpoint, { method: 'DELETE', headers })
  };
});
