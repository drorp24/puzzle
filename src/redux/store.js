import { configureStore } from '@reduxjs/toolkit'

import app from './app'
import users from './users'

const store = configureStore({
  reducer: {
    app,
    users,
  },
})

export default store
