import React, { Component } from 'react'
import Portfolio from './components/Portfolio'
import utils from './utils'
import gameState from './gameState'

// External libraries
import { Howl } from 'howler';

// Asset imports
import * as spaceSounds from './assets/deep_space.mp3'
import * as rocketShipImage from './assets/rocket-ship.png'
import * as thrustImage from './assets/thrust.png'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      asteroidRadius: 10,
      fps: 60,
      rocketShipImage: null,
      thrustImage: null
    }
  }

  componentDidMount = () => {
    // Initialize the game and then start it
    this.initObjects()
    this.initCanvas()
    this.start()
  }

  initObjects = () => {
    // Generate all game objects
    gameState.setState({ asteroids: utils.generateAsteroids(25, this.state.asteroidRadius) })
    gameState.setState({ stars: utils.generateStars(window.innerWidth, window.innerHeight) })
    gameState.setState({ rocket: utils.generateRocket() })
  }

  initCanvas = () => {
    // Initialize canvas size, store its context and add an event listener
    // to make the canvas responsive
    const canvas = this.refs.canvas
    gameState.setState({ ctx: canvas.getContext('2d', { alpha: false }) })
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    window.addEventListener('resize', (event) => {
      this.refs.canvas.width  = window.innerWidth
      this.refs.canvas.height = window.innerHeight
      gameState.setState({ stars: utils.generateStars(window.innerWidth, window.innerHeight) })
    });
  }

  start = () => {
    // Start soundtrack
    this.sound = new Howl({
      src: [spaceSounds],
      autoplay: true,
      loop: true,
      volume: 0.5,
    });     
    this.sound.play();

    // Load images
    const images = [rocketShipImage, thrustImage]
    utils.loadImages(images).then((result) => {
      this.setState({
        rocketShipImage: result[0],
        thrustImage: result[1]
      })

      // Start game loop
      requestAnimationFrame(this.updateState)
    })
  }

  updateState = () => {
    // Update all game objects
    this.draw()
    this.updateAsteroids()
    this.updateRocket()
    this.updateFlyingStars()
  }

  draw = () => {
    // Draw all game objects
    this.clearCanvas()
    this.drawBackground()
    this.drawStars()
    this.drawFlyingStars()
    this.drawAsteroids()
    this.drawRocket()
    requestAnimationFrame(this.updateState)
  }


  componentWillUnmount = () => {
    // Stop music
    this.sound.stop()
  }

  clearCanvas = () => {
    const { ctx } = gameState.getState()
    ctx.beginPath()
    ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height)
    ctx.closePath();
  }

  // Generates the colorful background
  // that changes color
  drawBackground = () => {
    const { ctx, bgColors, bgCounter, currentBgColors } = gameState.getState()
    ctx.beginPath()
    var grd=ctx.createLinearGradient(0, this.refs.canvas.height, this.refs.canvas.width, 0);
    gameState.setState({ bgCounter: bgCounter + 1 })
    // Change background colors
    for (let round = 0; round < 3; round++) {
      if (bgCounter !== 3) { break } 
      gameState.setState({ bgCounter: 0 })
      let completedAmount = 0
      for (let i = 0; i < bgColors.length; i++) {
        const nextIndex = i === bgColors.length - 1 ? 0 : i + 1
        const nextValue = currentBgColors[nextIndex].substring(round * 2, round * 2 + 2)
        const targetValue = bgColors[i].substring(round * 2, round * 2 + 2)
        if (parseInt(nextValue, 16) < parseInt(targetValue, 16)) {
          let newValue = (parseInt(nextValue, 16) + 1).toString(16)
          if (newValue.length === 1) {
            newValue = '0' + newValue
          }
          const result = currentBgColors[nextIndex].substring(0, round * 2) + newValue + currentBgColors[nextIndex].substring(round * 2 + 2, currentBgColors[nextIndex].length)
          currentBgColors[nextIndex] = result
        } else if (parseInt(nextValue, 16) > parseInt(targetValue, 16)) {
          let newValue = (parseInt(nextValue, 16) - 1).toString(16)
          if (newValue.length === 1) {
            newValue = '0' + newValue
          }
          const result = currentBgColors[nextIndex].substring(0, round * 2) + newValue + currentBgColors[nextIndex].substring(round * 2 + 2, currentBgColors[nextIndex].length)
          currentBgColors[nextIndex] = result
        } else {
          completedAmount = completedAmount + 1
        }
        if (completedAmount === currentBgColors.length) {
          gameState.setState({ bgColors: currentBgColors.slice() })
        }
        gameState.setState({ currentBgColors })
      }
    }

    currentBgColors.forEach((color, i) => {
      grd.addColorStop(i / currentBgColors.length, `#${color.toUpperCase()}`)
    })

    ctx.fillStyle=grd;
    ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
    ctx.closePath();
  }

  // Draw the stars
  drawStars = () => {
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

  // Randomly generates a new flying star
  // There can be max 5 flying stars alive at once
  generateFlyingStar = () => {
    const { flyingStars } = gameState.getState()
    if (Math.random() < 0.004 && flyingStars.length < 5) {
      const randomCoordinate = utils.generateRandomCoordinate(window.innerWidth, window.innerHeight)
      const startX = randomCoordinate.x
      const startY = randomCoordinate.y
      const lifespan = Math.random() * 50 + 100
      const xDir = utils.generateDirection() * Math.random() * 2
      const yDir = utils.generateDirection() * Math.random() * 2
      gameState.setState({ flyingStars: flyingStars.concat({start: { x: startX, y: startY }, current: { x: startX, y: startY }, lifespan, age: 0, xDir, yDir, isDead: false }) })
    }
  }

  // Update flying stars' position etc.
  updateFlyingStars = () => {
    this.generateFlyingStar()
    const { flyingStars } = gameState.getState()
    flyingStars.forEach((flyingStar) => {
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
    })
    gameState.setState({ flyingStars: flyingStars.filter((flyingStar) => !flyingStar.isDead) })
  }

  // Draw the flying stars
  drawFlyingStars = () => {
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

  // Removes asteroids that are out of screen or too close to camera
  // and sorts them by size from camera's perspective
  clearOutOfBoundsAsteroids = () => {
    const { asteroids } = gameState.getState()
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
    gameState.setState({ asteroids: updatedAsteroids })
    // Replace removed asteroids with new ones
    for (let i = 0; i < originalLength - updatedAsteroids.length; i++) {
      gameState.setState({ asteroids: gameState.getState().asteroids.concat(utils.createAsteroid()) })
    }
  }

  // Updates asteroids' state like position etc.
  updateAsteroids = () => {
    this.clearOutOfBoundsAsteroids()
    const { asteroids } = gameState.getState()
    const updatedAsteroids = []
    asteroids.forEach((asteroid) => {
      const radius = asteroid.radius
      const scaledRadius = radius * Math.pow(2, -asteroid.z / 100)
      const newAsteroid = {
        ...asteroid,
        x: asteroid.x + asteroid.speed.x * (scaledRadius / 100),
        y: asteroid.y + asteroid.speed.y * (scaledRadius / 100),
        z: asteroid.z + asteroid.speed.z * (scaledRadius / 10),
        radius,
      }
      updatedAsteroids.push(newAsteroid)
    })
    gameState.setState({ asteroids: updatedAsteroids })
  }

  // Draws asteroids to screen
  drawAsteroids = () => {
    const { asteroids, ctx } = gameState.getState()
    ctx.strokeStyle = 'black'
    asteroids.forEach((asteroid) => {
      ctx.beginPath()
      const radius = asteroid.radius
      const scaledRadius = radius * Math.pow(2, -asteroid.z / 100)
      ctx.arc(asteroid.x - scaledRadius, asteroid.y - scaledRadius, scaledRadius, 0, 2 * Math.PI)
      ctx.lineWidth = 2
      const colorYOffset = asteroid.colorYOffset
      const grd2 = ctx.createRadialGradient(asteroid.x - scaledRadius / 2,asteroid.y - colorYOffset*1.3*scaledRadius,colorYOffset*(scaledRadius / 2),asteroid.x - scaledRadius / 2, asteroid.y-colorYOffset*1.3*scaledRadius, colorYOffset*(1.7*scaledRadius))
      asteroid.colors.forEach((color, i) => {
        grd2.addColorStop(i/asteroid.colors.length, color)
      })
      ctx.fillStyle=grd2;
      ctx.fill()
      ctx.closePath()
      ctx.beginPath()
      ctx.arc(asteroid.x - scaledRadius, asteroid.y - scaledRadius, scaledRadius, 0, 2 * Math.PI)
      ctx.lineWidth = 2
      const grd3 = ctx.createRadialGradient(asteroid.x - scaledRadius / 2,asteroid.y - 1.3*scaledRadius,scaledRadius / 2,asteroid.x - scaledRadius / 2, asteroid.y-1.3*scaledRadius, 1.7*scaledRadius)
      grd3.addColorStop(0, '#00000000')
      grd3.addColorStop(1, '#FFFFFF')
      ctx.fillStyle=grd3;
      ctx.fill()
      ctx.closePath()
      ctx.beginPath()
      ctx.arc(asteroid.x - scaledRadius, asteroid.y - scaledRadius, scaledRadius, 0, 2 * Math.PI)
      ctx.lineWidth = 2
      const grd4 = ctx.createRadialGradient(asteroid.x - scaledRadius * 1.6,asteroid.y - scaledRadius * 0.6,scaledRadius / 4,asteroid.x - scaledRadius * 1.6, asteroid.y-scaledRadius * 0.6, 2*scaledRadius)
      grd4.addColorStop(0, '#00000000')      
      grd4.addColorStop(1, '#000000')

      ctx.fillStyle=grd4
      ctx.fill()
      ctx.closePath()
    })
  }

  // Updates rocket state like position etc.
  updateRocket = () => {
    const { rocket } = gameState.getState()
    const newRocket = {
      ...rocket,
      x: rocket.x + rocket.speed.x * 0.1,
      y: rocket.y + rocket.speed.y * 0.1,
      z: rocket.z,
      rotation: rocket.rotation + rocket.speed.rotation * 0.1,
    }

    const offset = 20
    if (newRocket.x < 0 - offset) {
      newRocket.x = window.innerWidth + offset
    } else if (newRocket.x > window.innerWidth + offset) {
      newRocket.x = 0 - offset
    }

    if (newRocket.y < 0 - offset) {
      newRocket.y = window.innerHeight + offset
    } else if (newRocket.y > window.innerHeight + offset) {
      newRocket.y = 0 - offset
    }

    if (Math.random() < 0.008 || newRocket.smoking) {
      // -90 is needed because the rocket points upwards at start
      const changeX = Math.cos(Math.radians(newRocket.rotation - 90)) * 0.05
      const changeY = Math.sin(Math.radians(newRocket.rotation - 90)) * 0.05

      newRocket.speed.x = newRocket.speed.x + changeX
      newRocket.speed.y = newRocket.speed.y + changeY
      if (!newRocket.smoking) {
      setTimeout(() => {
        
        gameState.setState({ rocket: { ...gameState.getState().rocket, smoking: false } })
        }, Math.random() * 1000)
      }

      newRocket.smoking = true
      for (let i = 0; i < Math.random() * 6; i++) {
        const smokeX = newRocket.x - 20 * Math.cos(Math.radians(newRocket.rotation - 90))
        const smokeY = newRocket.y - 20 * Math.sin(Math.radians(newRocket.rotation - 90))
        const radius = Math.random() * 5
        const randX = Math.random()
        const randY = Math.random()

        const smokeSpeedX = newRocket.speed.x - 20 * Math.cos(Math.radians(newRocket.rotation - 90))
        const smokeSpeedY = newRocket.speed.y - 20 * Math.sin(Math.radians(newRocket.rotation - 90))

        const smokeSpeed = { x: (smokeSpeedX / 10 + randX) / 2, y: (smokeSpeedY / 10 + randY) / 2 }
        const colorValue = Math.floor(160 + Math.random() * 60)
        const smokeColor = `#${utils.integerToHex(colorValue).repeat(3)}`
        newRocket.smoke = newRocket.smoke.concat({ x: smokeX, y: smokeY, radius, speed: smokeSpeed, timestamp: Date.now(), color: smokeColor })
      }
    }

    if (Math.random() < 0.005 && newRocket.thrust === 0) {
      const thrustDir = utils.generateDirection()
      newRocket.thrust = thrustDir
      newRocket.speed.rotation = newRocket.speed.rotation + thrustDir * 3
      setTimeout(() => {
        gameState.setState({
          rocket: {
            ...gameState.getState().rocket,
            thrust: 0
          }
        })
      }, 1000)
    }

    newRocket.smoke.forEach((particle, i) => {
      const lifetime = Date.now() - particle.timestamp
      let sizeRatio = (1-(lifetime/3000*particle.radius/6))
      if (sizeRatio < 0) {
        sizeRatio = 0
      }
      particle = { ...particle, x: particle.x + particle.speed.x, y: particle.y + particle.speed.y }
      newRocket.smoke[i] = particle
    })

    newRocket.smoke = newRocket.smoke.filter((particle) => {
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

    gameState.setState({ rocket: newRocket })
  }

  // Draws rocket to screen
  drawRocket = () => {
    const { ctx, rocket } = gameState.getState()
    ctx.save();
    ctx.translate(rocket.x,rocket.y);
    ctx.rotate(rocket.rotation*Math.PI/180);
    ctx.translate(-rocket.x, -rocket.y)
    ctx.beginPath()
    ctx.drawImage(this.state.rocketShipImage, rocket.x - 45, rocket.y - 26, 90, 52)
    if (rocket.thrust !== 0) {
      ctx.translate(rocket.x,rocket.y);
      ctx.rotate(rocket.thrust*90*Math.PI/180);
      ctx.translate(-rocket.x, -rocket.y)
      if (rocket.thrust < 0) {
        ctx.drawImage(this.state.thrustImage, rocket.x - 2, rocket.y + 7, 20, 20)
      } else {
        ctx.drawImage(this.state.thrustImage, rocket.x - 18, rocket.y + 7, 20, 20)
      }
    }
    ctx.closePath()
    ctx.restore();
    this.drawRocketSmoke()
  }

  // Draws rocket's smoke
  drawRocketSmoke = () => {
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

  render() {
    return (
      <div style={ styles.container }>
        {/* <div style={ styles.portfolio }>
          <Portfolio />
        </div> */}
        <canvas ref='canvas' />
      </div>
    );
  }
}

const styles = {
  container: {
    position: 'absolute'
  },
  portfolio: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    left: '20%',
    right: '20%',
    top: '5%',
  }
}

export default App;
