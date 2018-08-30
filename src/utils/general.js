
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

export const generateRandomColors = (max = 10) => {
  const colors = []
  for (let i = 0; i < Math.random() * max; i++) {
    colors.push(getRandomColor())
  }
  return colors
}

const integerToHex = (value) => {
  let hex = value.toString(16)
  if (hex.length < 2) {
    hex = '0' + hex
  }
  return hex
}

export const generateDirection = () => Math.random() < 0.5 ? -1 : 1

const generateRandomCoordinate = (width, height) => {
  const randomX = Math.random() * width
  const randomY = Math.random() * height
  return { x: randomX, y: randomY }
}

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const resultImage = new Image()
    resultImage.src = src
    resultImage.addEventListener('load', () => {
      resolve(resultImage)
    })
  })
}

const stringReplace = (target, indexStart, newValue) => target.substring(0, indexStart) + newValue + target.substring(indexStart + newValue.length)

const loadImages = (sources) => {
  const imagePromises = sources.map((src) => loadImage(src))
  return new Promise((resolve) => {
    Promise.all(imagePromises).then((values) => {
      resolve(values)
    })
  })
}

export default {
  getRandomColor,
  generateRandomColors,
  integerToHex,
  generateDirection,
  generateRandomCoordinate,
  stringReplace,
  loadImages,
}