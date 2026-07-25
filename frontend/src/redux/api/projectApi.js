import { apiSlice } from './apiSlice';

export const projectApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProjectById: builder.query({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation({
      query: (projectData) => ({
        url: '/projects',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation({
      query: ({ id, projectData }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: projectData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        'Project',
      ],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
    uploadProjectAttachment: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/projects/${id}/attachments`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Project', id }],
    }),
    getComments: builder.query({
      query: ({ entityType, entityId }) => `/projects/comments/${entityType}/${entityId}`,
      providesTags: (result, error, { entityId }) => [{ type: 'Comment', id: entityId }],
    }),
    addComment: builder.mutation({
      query: (commentData) => ({
        url: '/projects/comments',
        method: 'POST',
        body: commentData,
      }),
      invalidatesTags: (result, error, { entityId }) => [{ type: 'Comment', id: entityId }],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUploadProjectAttachmentMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
} = projectApi;
