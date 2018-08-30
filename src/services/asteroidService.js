import utils from '../utils'

const updateAsteroids = (asteroids) => {
  return clearOutOfBoundsAsteroids(asteroids).map((asteroid) => {
    const radius = asteroid.radius
    const scaledRadius = radius * Math.pow(2, -asteroid.z / 100)
    return {
      ...asteroid,
      x: asteroid.x + asteroid.speed.x * (scaledRadius / 100),
      y: asteroid.y + asteroid.speed.y * (scaledRadius / 100),
      z: asteroid.z + asteroid.speed.z * (scaledRadius / 10),
      radius,
    }
  })
}

const clearOutOfBoundsAsteroids = (asteroids) => {
  const originalLength = asteroids.length
  const updatedAsteroids = asteroids.filter((asteroid) => {
    // Scaled radius = asteroid's size from camera's perspective
    const scaledRadius = asteroid.radius * Math.pow(2, -asteroid.z / 100)
    const maxWidth = window.innerWidth + 2 * scaledRadius
    const maxHeight = window.innerHeight + 2 * scaledRadius
    const minWidth = 0 - 2 * scaledRadius
    const minHeight =  0 - 2 * scaledRadius

    // Check if asteroid is out of screen
    if (utils.isOutOfBounds(asteroid.x, asteroid.y, minWidth, maxWidth, minHeight, maxHeight)) {
      return false
    }

    // Check if asteroid is too close to camera
    if (scaledRadius <= 1.2 || scaledRadius > window.innerWidth * 2) {
      return false
    }

    return true
  }).sort((a, b) => (a.radius * Math.pow(2, -a.z / 100)) - (b.radius * Math.pow(2, -b.z / 100)))
  // Replace removed asteroids with new ones
  for (let i = 0; i < originalLength - updatedAsteroids.length; i++) {
    updatedAsteroids.push(utils.createAsteroid())
  }
  return updatedAsteroids
}

export default { updateAsteroids }