import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout, setCredentials } from '../slices/authSlice';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.origin.includes('vercel.app')) {
    return 'https://zenflow-backend.onrender.com/api';
  }
  return '/api';
};

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.warn('[RTK Query] 401 Unauthorized detected. Attempting token rotation...');
    
    // Try to get a new access token via refresh token cookie
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult.data && refreshResult.data.success) {
      const newToken = refreshResult.data.token;
      
      // Update credentials in redux
      const currentUser = api.getState().auth.user;
      api.dispatch(setCredentials({ user: currentUser, token: newToken }));

      // Retry the original failed query with the new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, force logout
      console.error('[RTK Query] Token rotation failed. Logging out...');
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Department', 'Project', 'Task', 'Leave', 'Attendance', 'Chat', 'Message'],
  endpoints: () => ({}),
});
