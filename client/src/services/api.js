import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.userId ? { userId: user.userId } : {};
};

export const authService = {
  login: async (userId) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { userId });
    return response.data;
  }
};

export const adminService = {
  generateData: async () => {
    const response = await axios.post(`${API_BASE_URL}/admin/generate-data`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  createUser: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/admin/create-user`, userData, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getUsers: async () => {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};

export const movieService = {
  getMovies: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/movies`, { params });
    return response.data;
  },

  getLanguages: async () => {
    const response = await axios.get(`${API_BASE_URL}/movies/languages`);
    return response.data;
  },

  getGenres: async () => {
    const response = await axios.get(`${API_BASE_URL}/movies/genres`);
    return response.data;
  },

  fetchMoviesFromTMDB: async () => {
    const response = await axios.post(`${API_BASE_URL}/movies/fetch`);
    return response.data;
  }
};

export const userService = {
  getUsers: async () => {
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  createUser: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/users/create`, userData, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getUser: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  },

  getUserRatings: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/ratings`);
    return response.data;
  },

  initializeData: async () => {
    const response = await axios.post(`${API_BASE_URL}/users/initialize`);
    return response.data;
  }
};

export const recommendationService = {
  getRecommendations: async (userId, limit = 10) => {
    const response = await axios.get(`${API_BASE_URL}/recommendations/${userId}`, {
      params: { limit }
    });
    return response.data;
  }
};
