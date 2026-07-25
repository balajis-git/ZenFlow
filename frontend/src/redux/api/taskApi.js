import { apiSlice } from './apiSlice';

export const taskApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasksByProject: builder.query({
      query: (projectId) => `/tasks/project/${projectId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.tasks.map(({ _id }) => ({ type: 'Task', id: _id })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
    }),
    getTaskById: builder.query({
      query: (id) => `/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: '/tasks',
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),
    updateTask: builder.mutation({
      query: ({ id, taskData }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: taskData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),
    updateTaskStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/tasks/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
      ],
    }),
    uploadTaskAttachment: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/tasks/${id}/attachments`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Task', id }],
    }),
  }),
});

export const {
  useGetTasksByProjectQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useUploadTaskAttachmentMutation,
} = taskApi;
