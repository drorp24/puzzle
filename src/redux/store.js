import { configureStore } from '@reduxjs/toolkit'

import app from './app'
import users from './users'
import content from './content'
import feedback from './feedback'

const store = configureStore({
  reducer: {
    app,
    users,
    content,
    feedback,
  },
})

export default store
