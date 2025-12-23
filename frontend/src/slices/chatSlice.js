import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const fetchChatData = createAsyncThunk(
  'chat/fetchChatData',
  async (token) => {
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
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatData.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchChatData.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.channels = action.payload.channels
        state.messages = action.payload.messages
      })
      .addCase(fetchChatData.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export default chatSlice.reducer
