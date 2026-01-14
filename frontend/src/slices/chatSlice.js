import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const fetchChatData = createAsyncThunk(
  'chat/fetchChatData',
  async token => {
    const headers = {
      Authorization: `Bearer ${token}`,
    }
    const [channelsResponse, messagesResponse] = await Promise.all([
      fetch('/api/v1/channels', { headers }),
      fetch('/api/v1/messages', { headers }),
    ])

    if (!channelsResponse.ok || !messagesResponse.ok) {
      throw new Error('Failed to load chat data')
    }

    const [channels, messages] = await Promise.all([
      channelsResponse.json(),
      messagesResponse.json(),
    ])

    return { channels, messages }
  },
)

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    channels: [],
    messages: [],
    currentChannelId: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setCurrentChannelId: (state, action) => {
      state.currentChannelId = action.payload
    },
    addChannel: (state, action) => {
      const exists = state.channels.some(channel => channel.id === action.payload.id)
      if (!exists) {
        state.channels.push(action.payload)
      }
    },
    renameChannel: (state, action) => {
      const { id, name } = action.payload
      const channel = state.channels.find(item => item.id === id)
      if (channel) {
        channel.name = name
      }
    },
    removeChannel: (state, action) => {
      const channelId = action.payload
      state.channels = state.channels.filter(channel => channel.id !== channelId)
      state.messages = state.messages.filter(message => message.channelId !== channelId)
      if (state.currentChannelId === channelId) {
        const general = state.channels.find(channel => channel.name === 'general')
        state.currentChannelId = general ? general.id : state.channels[0]?.id ?? null
      }
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload)
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchChatData.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchChatData.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.channels = action.payload.channels
        state.messages = action.payload.messages
        if (!state.currentChannelId && state.channels.length > 0) {
          const general = state.channels.find(channel => channel.name === 'general')
          state.currentChannelId = general ? general.id : state.channels[0].id
        }
      })
      .addCase(fetchChatData.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export const {
  addChannel,
  addMessage,
  renameChannel,
  removeChannel,
  setCurrentChannelId,
} = chatSlice.actions
export default chatSlice.reducer
