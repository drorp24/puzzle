function containsHeb(str) {
  return /[\u0590-\u05FF]/.test(str)
}

export default containsHeb
