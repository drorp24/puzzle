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
      if (response.data.accessToken) {
        // ToDo: see that a refresh token is included in the data and kept as well
        localStorage.setItem('user', JSON.stringify(response.data))
      }

      return response.data
    })
}

export const logout = () => {
  localStorage.removeItem('user')
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
      // ToDo: modify with the actual names of the accessToken and refreshToken
      Authorization: `Bearer ${keys.access_token}`,
      Accept: 'application/json',
      // ToDo: might require the below. axios say they don't support that out of the box (?)
      'Content-Type': 'application/x-www-form-urlencoded',
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
    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true
      const access_token = await refreshAccessToken()
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + access_token
      return axiosApiInstance(originalRequest)
    }
    return Promise.reject(error)
  }
)

const refreshAccessToken = async () => {}

// ! application/x-www-form-urlencoded
// By default, axios serializes JS objects to JSON
// To send data in the above format, do:
//
const params = new URLSearchParams()
params.append('param1', 'value1')
params.append('param2', 'value2')
axios.post('/foo', params)
