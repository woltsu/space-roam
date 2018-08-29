//const getRandomColor = () => `rgb(${Math.random() * 254}, ${Math.random() * 254}, ${Math.random() * 254})`

const generateHexValue = () => {
  let result = (Math.floor(Math.random()*15)).toString(16)
  return result.toLocaleUpperCase()
}

const getRandomColor = () => {
  let result = '#'
  for (let i = 0; i < 6; i++) {
    result = result + generateHexValue()
  }
  return result
}

export const generateRandomColors = () => {
  const colors = []
  for (let i = 0; i < Math.random() * 10; i++) {
    colors.push(getRandomColor())
  }
  return colors
}

export const generateDirection = () => Math.random() < 0.5 ? -1 : 1

export default {
  getRandomColor,
  generateRandomColors,
  generateDirection,
}