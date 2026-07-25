import { apiSlice } from './apiSlice';

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query({
      query: () => '/chats',
      providesTags: ['Chat'],
    }),
    createOrGetPrivateChat: builder.mutation({
      query: (userId) => ({
        url: '/chats/private',
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: ['Chat'],
    }),
    createGroupChat: builder.mutation({
      query: (groupData) => ({
        url: '/chats/group',
        method: 'POST',
        body: groupData,
      }),
      invalidatesTags: ['Chat'],
    }),
    getMessages: builder.query({
      query: (chatId) => `/chats/${chatId}/messages`,
      providesTags: (result, error, chatId) => [{ type: 'Message', id: chatId }],
    }),
    markMessagesAsRead: builder.mutation({
      query: (chatId) => ({
        url: `/chats/${chatId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, chatId) => [{ type: 'Chat', id: chatId }],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useCreateOrGetPrivateChatMutation,
  useCreateGroupChatMutation,
  useGetMessagesQuery,
  useMarkMessagesAsReadMutation,
} = chatApi;
