import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import { useGetMeQuery } from './redux/api/authApi';
import { setCredentials, logout } from './redux/slices/authSlice';

const App = () => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // If there's an active token but user details are missing, fetch profile on mount
  const { data, error, isSuccess, isError } = useGetMeQuery(undefined, {
    skip: !isAuthenticated || !token,
  });

  useEffect(() => {
    if (isSuccess && data?.success) {
      // Sync user profile details in Redux state
      dispatch(setCredentials({ user: data.user, token }));
    } else if (isError) {
      console.error('[Session Sync] Token validation failed:', error);
      dispatch(logout());
    }
  }, [isSuccess, isError, data, token, error, dispatch]);

  // Load and apply dark mode preference from local storage
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return <AppRoutes />;
};

export default App;
