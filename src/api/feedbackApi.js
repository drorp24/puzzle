import axios from 'axios'

const feedbackApi = async data => {
  console.log('feedbackApi. data: ', data)
  const feedbackEndpoint = `${process.env.REACT_APP_API_SERVER}${process.env.REACT_APP_FEEDBACK_ENDPOINT}`

  try {
    const feedbackResult = await axios.post(feedbackEndpoint, data)
    console.log('feedbackResult: ', feedbackResult)
  } catch (error) {
    console.log('error: ', error)
    console.log('error.response: ', error.response)
    console.log('error.response?.data: ', error.response?.data)
    console.log('error.response?.status: ', error.response?.status)
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
