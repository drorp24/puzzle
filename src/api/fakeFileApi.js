// https://www.robinwieruch.de/javascript-fake-api

const timeout = 100

const fakeValidityCheck = () =>
  new Promise((resolve, reject) => {
    if (Math.random() > 0.5) {
      return setTimeout(() => resolve(false), timeout)
    }

    setTimeout(() => resolve(true), timeout)
  })

export const isFileValid = async ({ file }) => {
  try {
    return await fakeValidityCheck()
  } catch (error) {
    return { error }
  }
}
