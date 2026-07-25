const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('zenflow_auth');
    if (serializedState === null) return { user: null, token: null, isAuthenticated: false };
    const parsed = JSON.parse(serializedState);
    return {
      user: parsed.user || null,
      token: parsed.token || null,
      isAuthenticated: !!parsed.token,
    };
  } catch (err) {
    return { user: null, token: null, isAuthenticated: false };
  }
};

import { createSlice } from '@reduxjs/toolkit';

const initialState = loadStateFromLocalStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      try {
        localStorage.setItem('zenflow_auth', JSON.stringify({ user, token }));
      } catch (err) {
        console.error('LocalStorage write failed:', err);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem('zenflow_auth');
      } catch (err) {
        console.error('LocalStorage remove failed:', err);
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      try {
        const stored = localStorage.getItem('zenflow_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.user = { ...parsed.user, ...action.payload };
          localStorage.setItem('zenflow_auth', JSON.stringify(parsed));
        }
      } catch (err) {
        console.error('LocalStorage update failed:', err);
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
