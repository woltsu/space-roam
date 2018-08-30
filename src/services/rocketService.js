import utils from '../utils'
import gameState from '../gameState'

const updateRocket = (rocket) => {
  const updatedRocket = {
    ...rocket,
    x: rocket.x + rocket.speed.x * 0.1,
    y: rocket.y + rocket.speed.y * 0.1,
    z: rocket.z,
    rotation: rocket.rotation + rocket.speed.rotation * 0.1,
  }

  const offset = 20
  if (updatedRocket.x < 0 - offset) {
    updatedRocket.x = window.innerWidth + offset
  } else if (updatedRocket.x > window.innerWidth + offset) {
    updatedRocket.x = 0 - offset
  }

  if (updatedRocket.y < 0 - offset) {
    updatedRocket.y = window.innerHeight + offset
  } else if (updatedRocket.y > window.innerHeight + offset) {
    updatedRocket.y = 0 - offset
  }

  throttleRocket(updatedRocket)
  thrustRocket(updatedRocket)
  updateRocketSmoke(updatedRocket)
  
  return updatedRocket
}

const throttleRocket = (rocket) => {
  if (Math.random() < 0.008 || rocket.smoking) {
    // -90 is needed because the rocket points upwards at start
    const changeX = Math.cos(Math.radians(rocket.rotation - 90)) * 0.05
    const changeY = Math.sin(Math.radians(rocket.rotation - 90)) * 0.05

    rocket.speed.x = rocket.speed.x + changeX
    rocket.speed.y = rocket.speed.y + changeY
    if (!rocket.smoking) {
      setTimeout(() => {
        gameState.setState({ rocket: { ...gameState.getState().rocket, smoking: false } })
      }, Math.random() * 1000)
    }

    rocket.smoking = true
    for (let i = 0; i < Math.random() * 6; i++) {
      const smokeX = rocket.x - 20 * Math.cos(Math.radians(rocket.rotation - 90))
      const smokeY = rocket.y - 20 * Math.sin(Math.radians(rocket.rotation - 90))
      const radius = Math.random() * 5
      const randX = Math.random()
      const randY = Math.random()

      const smokeSpeedX = rocket.speed.x - 20 * Math.cos(Math.radians(rocket.rotation - 90))
      const smokeSpeedY = rocket.speed.y - 20 * Math.sin(Math.radians(rocket.rotation - 90))

      const smokeSpeed = { x: (smokeSpeedX / 10 + randX) / 2, y: (smokeSpeedY / 10 + randY) / 2 }
      const colorValue = Math.floor(160 + Math.random() * 60)
      const smokeColor = `#${utils.integerToHex(colorValue).repeat(3)}`
      rocket.smoke = rocket.smoke.concat({ x: smokeX, y: smokeY, radius, speed: smokeSpeed, timestamp: Date.now(), color: smokeColor })
    }
  }
}

const thrustRocket = (rocket) => {
  if (Math.random() < 0.005 && rocket.thrust === 0) {
    const thrustDir = utils.generateDirection()
    rocket.thrust = thrustDir
    rocket.speed.rotation = rocket.speed.rotation + thrustDir * 3
    setTimeout(() => {
      gameState.setState({
        rocket: {
          ...gameState.getState().rocket,
          thrust: 0
        }
      })
    }, 1000)
  }
}

const updateRocketSmoke = (rocket) => {
  rocket.smoke.forEach((particle, i) => {
    const lifetime = Date.now() - particle.timestamp
    let sizeRatio = (1-(lifetime/3000*particle.radius/6))
    if (sizeRatio < 0) {
      sizeRatio = 0
    }
    particle = { ...particle, x: particle.x + particle.speed.x, y: particle.y + particle.speed.y }
    rocket.smoke[i] = particle
  })

  rocket.smoke = rocket.smoke.filter((particle) => {
    if (particle.x < 0 || particle.x > window.innerWidth) {
      return false
    }
    if (particle.y < 0 || particle.y > window.innerHeight) {
      return false
    }
    const lifetime = Date.now() - particle.timestamp
    const r = particle.radius * (1-(lifetime/3000*particle.radius/6))
    if (r <= 1) {
      return false
    }
    return true
  })
}

export default { updateRocket }
