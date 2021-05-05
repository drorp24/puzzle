import store from '../redux/store'

import { logout } from '../redux/users'

import axios from 'axios'

const loginEndpoint = `${process.env.REACT_APP_API_SERVER}${process.env.REACT_APP_LOGIN_ENDPOINT}`

// bezkoder.com/react-hooks-redux-login-registration-example/

export const login = async ({ username, password }) => {
  return axios
    .post(loginEndpoint, {
      username,
      password,
    })
    .then(response => {
      if (response.data?.access_token) {
        // ToDo: see that a refresh token is included in the data and kept as well
        localStorage.setItem('user', JSON.stringify(response.data))
      }

      return response.data
    })
    .catch(error => {
      // eslint-disable-next-line no-throw-literal
      throw {
        api: 'user',
        value: { username },
        issue: error.response?.data?.error || 'No response from Api',
        status: error.response?.status,
      }
    })
}

export const logOut = () => {
  localStorage.removeItem('user')
  store.dispatch(logout())
}

// ! Requests header generation, Response refresh handling
//
//  axios' interceptors allow every relevant api to merely call axiosApiInstance,
//  leaving req header generation and res refresh handling to be handled here.
//
//  const result = await axiosApiInstance.post(url, data)
//
// https://thedutchlab.com/blog/using-axios-interceptors-for-refreshing-your-api-token
// (converted the redis example into localStorage)
//
export const axiosApiInstance = axios.create()

// * req header generation

axiosApiInstance.interceptors.request.use(
  async config => {
    const value = localStorage.getItem('user')
    const keys = JSON.parse(value)
    config.headers = {
      Authorization: `Bearer ${keys.access_token}`,
    }
    return config
  },
  error => {
    Promise.reject(error)
  }
)

// * res refresh handling
axiosApiInstance.interceptors.response.use(
  response => {
    return response
  },
  async function (error) {
    const originalRequest = error.config
    //
    // * Refresh (403) convention:
    // * use the refresh token to acquire a new access token then replace it in the header for subsequent calls
    //
    // if (error.response.status === 403 && !originalRequest._retry) {
    //   originalRequest._retry = true
    //   const access_token = await refreshAccessToken()
    //   axios.defaults.headers.common['Authorization'] = 'Bearer ' + access_token
    //   return axiosApiInstance(originalRequest)
    // }
    // * Refresh workaround: simply logout
    if (error.response.status === 403) logOut()

    return Promise.reject(error)
  }
)

const refreshAccessToken = async () => {}

// ! application/x-www-form-urlencoded
// By default, axios serializes JS objects to JSON
// To send data in the above format, do:
//
// const params = new URLSearchParams()
// params.append('param1', 'value1')
// params.append('param2', 'value2')
// axios.post('/foo', params)
