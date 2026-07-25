import { apiSlice } from './apiSlice';

export const employeeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: (params) => {
        let queryString = '';
        if (params) {
          const searchParams = new URLSearchParams();
          Object.keys(params).forEach((key) => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
              searchParams.append(key, params[key]);
            }
          });
          queryString = `?${searchParams.toString()}`;
        }
        return {
          url: `/employees${queryString}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.employees.map(({ _id }) => ({ type: 'User', id: _id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
    getEmployeeById: builder.query({
      query: (id) => `/employees/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    createEmployee: builder.mutation({
      query: (formData) => ({
        url: '/employees',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }, 'Department'],
    }),
    updateEmployee: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/employees/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
        'Department',
      ],
    }),
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }, 'Department'],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
