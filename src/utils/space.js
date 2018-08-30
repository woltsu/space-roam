import { generateDirection, generateRandomColors } from './general'

const createAsteroid = (radius) => {
  const xDir = generateDirection()
  const yDir = generateDirection()
  const zDir = generateDirection()
  const speedX = Math.random() * xDir * 0.75
  const speedY = Math.random() * yDir * 0.75
  const speedZ = Math.random() * zDir * 0.25
  const r = Math.random() * 30
  const newAsteroid = {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    z: zDir < 0 ? 260 : -600,
    speed: { x: speedX, y: speedY, z: speedZ },
    radius: r,
    colors: generateRandomColors(20),
    colorYOffset: Math.random() * 2 * generateDirection(),
    colorXOffset: Math.random() * 2 * generateDirection(),
    radiusOffset: Math.random() * 2
  }
  return newAsteroid
}

const generateAsteroids = (howMany) => {
  const result = []
  for (let i = 0; i < howMany; i++) {
    result.push(createAsteroid())
  }
  return result
}

const generateStars = (width, height) => {
  const stars = []
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      stars.push({ x, y })
    }
  return stars
}

const generateRocket = () => {
  const xDir = generateDirection()
  const yDir = generateDirection()
  const zDir = generateDirection()
  const rotationDir = generateDirection()
  const speedX = Math.random() * xDir * 0.75
  const speedY = Math.random() * yDir * 0.75
  const speedZ = Math.random() * zDir * 0.05
  const rotationSpeed = Math.random() * rotationDir * 5
  const rocket = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    z: 200,
    speed: { x: speedX, y: speedY, z: speedZ, rotation: rotationSpeed },
    rotation: 0,
    smoke: [],
    thrust: 0,
    smoking: false
  }
  return rocket
}

const isOutOfBounds = (x, y, minWidth, maxWidth, minHeight, maxHeight) => {
  if (x < minWidth || x > maxWidth) {
    return true
  }

  if (y < minHeight || y > maxHeight) {
    return true
  }

  return false
}

export default {
  createAsteroid,
  generateAsteroids,
  generateStars,
  generateRocket,
  isOutOfBounds
}