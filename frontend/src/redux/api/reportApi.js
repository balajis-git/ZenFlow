import { apiSlice } from './apiSlice';

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardAnalytics: builder.query({
      query: () => '/reports/dashboard-analytics',
      providesTags: ['Project', 'Task', 'Leave', 'Attendance'],
    }),
    getActivityLogs: builder.query({
      query: (params) => ({
        url: '/reports/activity-logs',
        params,
      }),
      providesTags: ['ActivityLog'],
    }),
  }),
});

export const { useGetDashboardAnalyticsQuery, useGetActivityLogsQuery } = reportApi;
