import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
// import { getUser } from '../api/fakeUsersApi'
import { login } from '../api/authApi'

export const fetchUser = createAsyncThunk(
  'user/fetch',
  async ({ username, password }, thunkAPI) => {
    try {
      const data = await login({ username, password })
      // safeguard only; if api returns no data then it throws, reaching the catch below
      if (!data) throw new Error('No data returned')
      if (data.error) throw new Error(data.error?.message?.toString())
      return { ...data, username }
    } catch (error) {
      return thunkAPI.rejectWithValue(error)
    }
  }
)

const initialState = {
  currentRequestId: undefined,
  loading: 'idle',
  error: null,
  loggedIn: {},
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    logout: () => initialState,
  },
  extraReducers: {
    [fetchUser.pending]: (state, { meta: { requestId } }) => {
      if (state.loading === 'idle') {
        state.currentRequestId = requestId
        state.loading = 'pending'
        state.error = null
      }
    },

    [fetchUser.fulfilled]: (state, { meta: { requestId }, payload }) => {
      if (state.loading === 'pending' && state.currentRequestId === requestId) {
        state.currentRequestId = undefined
        state.loading = 'idle'
        state.error = null
        state.loggedIn = payload
      }
    },

    [fetchUser.rejected]: (state, { meta: { requestId }, payload }) => {
      if (state.loading === 'pending' && state.currentRequestId === requestId) {
        state.currentRequestId = undefined
        state.loading = 'idle'
        state.error = payload
      }
    },
  },
})

const { reducer, actions } = usersSlice
export const { logout } = actions

export default reducer
