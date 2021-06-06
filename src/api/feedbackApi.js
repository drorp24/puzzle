import { axiosApiInstance } from './authApi'

const feedbackApi = async data => {
  const feedbackEndpoint = `${process.env.REACT_APP_API_SERVER}${process.env.REACT_APP_FEEDBACK_ENDPOINT}`

  try {
    await axiosApiInstance.post(feedbackEndpoint, data)
    return data
  } catch (error) {
    // eslint-disable-next-line no-throw-literal
    throw {
      field: 'Entity location feedback',
      value: data,
      issue: error.response?.data?.error || 'Invalid file',
      status: error.response?.status,
    }
  }
}

export default feedbackApi
