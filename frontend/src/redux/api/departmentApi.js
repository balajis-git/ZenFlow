import { apiSlice } from './apiSlice';

export const departmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query({
      query: () => '/departments',
      providesTags: ['Department'],
    }),
    getDepartmentById: builder.query({
      query: (id) => `/departments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Department', id }],
    }),
    createDepartment: builder.mutation({
      query: (deptData) => ({
        url: '/departments',
        method: 'POST',
        body: deptData,
      }),
      invalidatesTags: ['Department'],
    }),
    updateDepartment: builder.mutation({
      query: ({ id, deptData }) => ({
        url: `/departments/${id}`,
        method: 'PUT',
        body: deptData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Department', id },
        'Department',
      ],
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Department'],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi;
