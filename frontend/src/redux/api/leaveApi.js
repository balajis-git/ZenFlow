import { apiSlice } from './apiSlice';

export const leaveApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    applyLeave: builder.mutation({
      query: (leaveData) => ({
        url: '/leaves',
        method: 'POST',
        body: leaveData,
      }),
      invalidatesTags: ['Leave'],
    }),
    getMyLeaveRequests: builder.query({
      query: () => '/leaves/my-requests',
      providesTags: ['Leave'],
    }),
    getAllLeaveRequests: builder.query({
      query: () => '/leaves',
      providesTags: ['Leave'],
    }),
    updateLeaveStatus: builder.mutation({
      query: ({ id, status, notes }) => ({
        url: `/leaves/${id}/status`,
        method: 'PATCH',
        body: { status, notes },
      }),
      invalidatesTags: ['Leave'],
    }),
  }),
});

export const {
  useApplyLeaveMutation,
  useGetMyLeaveRequestsQuery,
  useGetAllLeaveRequestsQuery,
  useUpdateLeaveStatusMutation,
} = leaveApi;
