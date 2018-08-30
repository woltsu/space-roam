  import utils from '../utils'

  const updateFlyingStars = (flyingStars) => {
    return generateFlyingStar(flyingStars).map((flyingStar) => {
      if (flyingStar.isDead) {
        return
      }

      flyingStar.age = flyingStar.age + 1
      let lifetime = flyingStar.age/flyingStar.lifespan
      if (lifetime > 1) {
        flyingStar.isDead = true
      }

      flyingStar.current = { x: flyingStar.current.x + 2 * flyingStar.xDir, y: flyingStar.current.y + 2 * flyingStar.yDir }
      if (
        utils.isOutOfBounds(flyingStar.start.x, flyingStar.start.y, 0, window.innerWidth, 0, window.innerHeight) &&
        utils.isOutOfBounds(flyingStar.current.x, flyingStar.current.y, 0, window.innerWidth, 0, window.innerHeight)
      ) {
        flyingStar.isDead = true
      }
      return flyingStar
    }).filter((flyingStar) => !flyingStar.isDead)
}

  // Randomly generates a new flying star
  // There can be max 5 flying stars alive at once
  const generateFlyingStar = (flyingStars) => {
    if (Math.random() < 0.004 && flyingStars.length < 5) {
      const randomCoordinate = utils.generateRandomCoordinate(window.innerWidth, window.innerHeight)
      const startX = randomCoordinate.x
      const startY = randomCoordinate.y
      const lifespan = Math.random() * 50 + 100
      const xDir = utils.generateDirection() * Math.random() * 2
      const yDir = utils.generateDirection() * Math.random() * 2
      return flyingStars.concat({ start: { x: startX, y: startY }, current: { x: startX, y: startY }, lifespan, age: 0, xDir, yDir, isDead: false })
    }
    return flyingStars
}

export default { updateFlyingStars }