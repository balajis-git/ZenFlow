import { apiSlice } from './apiSlice';

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTodayStatus: builder.query({
      query: () => '/attendance/today-status',
      providesTags: ['Attendance'],
    }),
    clockIn: builder.mutation({
      query: () => ({
        url: '/attendance/clock-in',
        method: 'POST',
      }),
      invalidatesTags: ['Attendance'],
    }),
    clockOut: builder.mutation({
      query: () => ({
        url: '/attendance/clock-out',
        method: 'POST',
      }),
      invalidatesTags: ['Attendance'],
    }),
    toggleBreak: builder.mutation({
      query: () => ({
        url: '/attendance/break',
        method: 'POST',
      }),
      invalidatesTags: ['Attendance'],
    }),
    getAttendanceHistory: builder.query({
      query: (userId) => {
        const urlStr = userId ? `/attendance/history/${userId}` : '/attendance/history';
        return urlStr;
      },
      providesTags: ['Attendance'],
    }),
  }),
});

export const {
  useGetTodayStatusQuery,
  useClockInMutation,
  useClockOutMutation,
  useToggleBreakMutation,
  useGetAttendanceHistoryQuery,
} = attendanceApi;
