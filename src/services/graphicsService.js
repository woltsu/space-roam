import utils from '../utils'
import gameState from '../gameState'

const redraw = () => {
  clearCanvas()
  drawBackground()
  drawStars()
  drawFlyingStars()
  drawAsteroids()
  drawRocket()
}

const clearCanvas = () => {
  const { ctx, canvas } = gameState.getState()
  ctx.beginPath()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.closePath();
}

const drawBackground = () => {
  const { ctx, bgColors, bgCounter, currentBgColors, canvas } = gameState.getState()
  ctx.beginPath()
  var grd=ctx.createLinearGradient(0, canvas.height, canvas.width, 0);
  gameState.setState({ bgCounter: bgCounter + 1 })
  for (let round = 0; round < 3; round++) {
    // bgCounter is used to set the speed at
    // which the background changes color
    if (bgCounter !== 3) { break } 
    gameState.setState({ bgCounter: 0 })
    let completedAmount = 0
    for (let i = 0; i < bgColors.length; i++) {
      const nextIndex = i === bgColors.length - 1 ? 0 : i + 1
      const nextValue = parseInt(currentBgColors[nextIndex].substring(round * 2, round * 2 + 2), 16)
      const targetValue = parseInt(bgColors[i].substring(round * 2, round * 2 + 2), 16)

      if (nextValue === targetValue) {
        completedAmount++
      } else {
        const transition = nextValue < targetValue ? 1 : -1
        const replacementValue = utils.integerToHex((nextValue + transition).toString(16))
        const newColorValue = utils.stringReplace(currentBgColors[nextIndex], round * 2, replacementValue)
        currentBgColors[nextIndex] = newColorValue
      }
      gameState.setState({ currentBgColors })
      if (completedAmount === currentBgColors.length) {
        gameState.setState({ bgColors: currentBgColors.slice() })
      }
    }
  }

  // Add the calculated and updated colors into the background
  currentBgColors.forEach((color, i) => {
    grd.addColorStop(i / currentBgColors.length, `#${color.toUpperCase()}`)
  })

  ctx.fillStyle=grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.closePath();
}

const drawStars = () => {
  const { ctx, stars } = gameState.getState()
  ctx.strokeStyle = 'white'
  ctx.fillStyle = 'white'
  ctx.lineWidth = 1
  stars.forEach((star) => {
    ctx.beginPath()
    ctx.arc(star.x, star.y, 1, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    ctx.closePath();
  })
}

const drawFlyingStars = () => {
  const { ctx, flyingStars } = gameState.getState()
  flyingStars.forEach((flyingStar) => {
    ctx.beginPath()
    const grd=ctx.createLinearGradient(flyingStar.start.x, flyingStar.start.y, flyingStar.current.x, flyingStar.current.y);
    let amountOfGradient = flyingStar.age/flyingStar.lifespan
    if (amountOfGradient > 1) {
      amountOfGradient = 1
    }
    grd.addColorStop(amountOfGradient, '#FFFFFF00')
    grd.addColorStop(1, '#FFFFFF')
    ctx.strokeStyle = grd
    ctx.lineWidth = 2
    ctx.moveTo(flyingStar.start.x,flyingStar.start.y);
    ctx.lineTo(flyingStar.current.x,flyingStar.current.y);
    ctx.stroke()
    ctx.closePath();
  })
}

const drawAsteroids = () => {
  const { asteroids, ctx } = gameState.getState()
  ctx.strokeStyle = 'black'
  asteroids.forEach((asteroid) => {
    ctx.beginPath()
    const radius = asteroid.radius
    const scaledRadius = radius * Math.pow(2, -asteroid.z / 100)
    ctx.arc(asteroid.x - scaledRadius, asteroid.y - scaledRadius, scaledRadius, 0, 2 * Math.PI)
    ctx.lineWidth = 2
    const colorYOffset = asteroid.colorYOffset
    const colorXOffset = asteroid.colorXOffset
    const radiusOffset = asteroid.radiusOffset
    const asteroidColor = ctx.createRadialGradient(asteroid.x - colorXOffset*scaledRadius / 2,asteroid.y - colorYOffset*1.3*scaledRadius,radiusOffset*(scaledRadius / 2),asteroid.x - colorXOffset*(scaledRadius / 2), asteroid.y-colorYOffset*1.3*scaledRadius,radiusOffset*(1.7*scaledRadius))
    asteroid.colors.forEach((color, i) => {
      asteroidColor.addColorStop(i/asteroid.colors.length, color)
    })
    ctx.fillStyle=asteroidColor;
    ctx.fill()
    ctx.closePath()
    // Draw asteroid's left white "shadow"
    ctx.beginPath()
    ctx.arc(asteroid.x - scaledRadius, asteroid.y - scaledRadius, scaledRadius, 0, 2 * Math.PI)
    ctx.lineWidth = 2
    const whiteShadow = ctx.createRadialGradient(asteroid.x - scaledRadius / 2,asteroid.y - 1.3*scaledRadius,scaledRadius / 2,asteroid.x - scaledRadius / 2, asteroid.y-1.3*scaledRadius, 1.7*scaledRadius)
    whiteShadow.addColorStop(0, '#00000000')
    whiteShadow.addColorStop(1, '#FFFFFF')
    ctx.fillStyle=whiteShadow;
    ctx.fill()
    ctx.closePath()
    // Draw asteroid's right black "shadow"
    ctx.beginPath()
    ctx.arc(asteroid.x - scaledRadius, asteroid.y - scaledRadius, scaledRadius, 0, 2 * Math.PI)
    ctx.lineWidth = 2
    const blackShadow = ctx.createRadialGradient(asteroid.x - scaledRadius * 1.6,asteroid.y - scaledRadius * 0.6,scaledRadius / 4,asteroid.x - scaledRadius * 1.6, asteroid.y-scaledRadius * 0.6, 2*scaledRadius)
    blackShadow.addColorStop(0, '#00000000')      
    blackShadow.addColorStop(1, '#000000')
    ctx.fillStyle=blackShadow
    ctx.fill()
    ctx.closePath()
  })
}

const drawRocket = () => {
  const { ctx, rocket, rocketShipImage, thrustImage } = gameState.getState()
  ctx.save();
  ctx.translate(rocket.x,rocket.y);
  ctx.rotate(rocket.rotation*Math.PI/180);
  ctx.translate(-rocket.x, -rocket.y)
  ctx.beginPath()
  ctx.drawImage(rocketShipImage, rocket.x - 45, rocket.y - 26, 90, 52)
  if (rocket.thrust !== 0) {
    ctx.translate(rocket.x,rocket.y);
    ctx.rotate(rocket.thrust*90*Math.PI/180);
    ctx.translate(-rocket.x, -rocket.y)
    if (rocket.thrust < 0) {
      ctx.drawImage(thrustImage, rocket.x - 2, rocket.y + 7, 20, 20)
    } else {
      ctx.drawImage(thrustImage, rocket.x - 18, rocket.y + 7, 20, 20)
    }
  }
  ctx.closePath()
  ctx.restore();
  drawRocketSmoke()
}

const drawRocketSmoke = () => {
  const { ctx, rocket } = gameState.getState()
  ctx.strokeStyle = 'black'
  rocket.smoke.forEach((particle, i) => {
    ctx.fillStyle = particle.color
    ctx.beginPath()
    const lifetime = Date.now() - particle.timestamp
    let sizeRatio = (1-(lifetime/3000*particle.radius/6))
    if (sizeRatio < 0) {
      sizeRatio = 0
    }
    ctx.arc(particle.x, particle.y, particle.radius * sizeRatio, 0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()
  })
}

export default { redraw }