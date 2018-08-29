import React, { Component } from 'react'
import Portfolio from './components/Portfolio'
import utils from './utils'
import { Howl, Howler } from 'howler';
import shuffle from 'shuffle-array'
import * as spaceSounds from './assets/deep_space.mp3'
import * as rocketShipImage from './assets/rocket-ship.png'
import * as thrustImage from './assets/thrust.png'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      asteroids: [],
      stars: [],
      rocket: null,
      flyingStars: [],
      ctx: null,
      radius: 10,
      bgColors: ['845EC2', '2C73D2', '0081CF', '0089BA', '008E9B', '008F7A'],
      currentBgColors: ['845EC2', '2C73D2', '0081CF', '0089BA', '008E9B', '008F7A'],
      bgCounter: 0,
    }
    this.fps = 60
  }

  componentDidMount = () => {
    this.initObjects()
    const canvas = this.refs.canvas
    const ctx = canvas.getContext('2d')
    this.setState({ ctx: canvas.getContext('2d') })
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    window.addEventListener('resize', (event) => {
      this.refs.canvas.width  = window.innerWidth
      this.refs.canvas.height = window.innerHeight
      this.setState({ stars: utils.generateStars(window.innerWidth, window.innerHeight) })
    });

    this.sound = new Howl({
      src: [spaceSounds],
      autoplay: true,
      loop: true,
      volume: 0.5,
    });     
    this.sound.play();

    const rocketShip = new Image()
    rocketShip.src = rocketShipImage
    rocketShip.addEventListener('load', () => {
      this.rocketShipImage = rocketShip
      const thrust = new Image()
      thrust.src = thrustImage
      thrust.addEventListener('load', () => {
        this.thrustImage = thrust
        setInterval(() => this.updateState(), (1000 / this.fps))
      }, false)
    }, false);
  }

  initObjects = () => {
    this.setState({ asteroids: utils.generateAsteroids(20, this.state.radius) })
    this.setState({ stars: utils.generateStars(window.innerWidth, window.innerHeight) })
    this.setState({ rocket: utils.generateRocket() })
  }

  updateState = () => {
    this.refreshBackground()
    this.refreshAsteroids()
    this.refreshRocket()
    this.clearOutOfBoundsAsteroids()
  }

  refreshBackground = () => {
    this.clearCanvas()
    this.generateBackground()
    this.drawStars()
    this.generateFlyingStars()
    this.drawFlyingStars()
  }

  start = () => {
    
  }

  componentWillUnmount = () => {
    this.sound.stop()
  }

  isOutOfBounds = (target) => {
    if (target.x < 0 || target.x > window.innerWidth) {
      return true
    }

    if (target.y < 0 || target.y > window.innerHeight) {
      return true
    }

    return false
  }

  clearOutOfBoundsAsteroids = () => {
    const { asteroids } = this.state
    const originalLength = asteroids.length
    const maxWidth = window.innerWidth
    const maxHeight = window.innerHeight
    const updatedAsteroids = asteroids.filter((asteroid) => {
      const radius = asteroid.radius
      const scaledRadius = asteroid.radius * Math.pow(2, -asteroid.z / 100)
  
      if (scaledRadius <= 1.2 || scaledRadius > window.innerWidth * 2) {
        return false
      }

      if (asteroid.x > maxWidth + 2 * scaledRadius || asteroid.y > maxHeight + 2 * scaledRadius) {
        return false
      }

      if (asteroid.x < 0 - 2 * scaledRadius|| asteroid.y < 0 - 2 * scaledRadius) {
        return false
      }

      return true
    }).sort((a, b) => (a.radius * Math.pow(2, -a.z / 100)) - (b.radius * Math.pow(2, -b.z / 100)))
    this.setState({ asteroids: updatedAsteroids })
    for (let i = 0; i < originalLength - updatedAsteroids.length; i++) {
      this.setState((prevState) => ({ asteroids: prevState.asteroids.concat(utils.createAsteroid()) }))
    }
  }

  clearCanvas = () => {
    const { ctx } = this.state
    ctx.beginPath()
    ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height)
    ctx.closePath();
  }

  generateBackground = () => {
    const { ctx, bgColors, bgCounter, currentBgColors } = this.state
    ctx.beginPath()
    var grd=ctx.createLinearGradient(0, this.refs.canvas.height, this.refs.canvas.width, 0);
    let temp = null
    this.setState({ bgCounter: bgCounter + 1 })
    for (let round = 0; round < 3; round++) {
      if (bgCounter != 3) { break } 
      this.setState({ bgCounter: 0 })
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
          this.setState({ bgColors: currentBgColors.slice() })
        }
        this.setState({ currentBgColors })
      }
    }

    currentBgColors.forEach((color, i) => {
      grd.addColorStop(i / currentBgColors.length, `#${color.toUpperCase()}`)
    })

    ctx.fillStyle=grd;
    ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
    ctx.closePath();
  }

  generateFlyingStars = () => {
    const { flyingStars } = this.state
    if (Math.random() < 0.0025 && flyingStars.length < 3) {
      const startX = Math.random() * window.innerWidth
      const startY = Math.random() * window.innerHeight
      const lifespan = Math.random() * 50 + 100
      const xDir = utils.generateDirection() * Math.random() * 2
      const yDir = utils.generateDirection() * Math.random() * 2
      this.setState({ flyingStars: flyingStars.concat({start: { x: startX, y: startY }, current: { x: startX, y: startY }, lifespan, age: 0, xDir, yDir, isDead: false }) })
    }
  }

  drawStars = () => {
    const { ctx, stars } = this.state
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

  drawFlyingStars = () => {
    const { ctx, flyingStars } = this.state
    flyingStars.forEach((flyingStar) => {
      if (flyingStar.isDead) {
        return
      }
      flyingStar.age = flyingStar.age + 1
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

      if (amountOfGradient === 1) {
        flyingStar.isDead = true
      }

      let changeRatio = 1
      if (flyingStar.age > flyingStar.lifespan / 2) {
        changeRatio = changeRatio / 2
      }
      
      flyingStar.current = { x: flyingStar.current.x + 2 * flyingStar.xDir, y: flyingStar.current.y + 2 * flyingStar.yDir }

      if (
        this.isOutOfBounds({ x: flyingStar.start.x, y: flyingStar.start.y }) &&
        this.isOutOfBounds({ x: flyingStar.current.x, y: flyingStar.current.y })
      ) {
        flyingStar.isDead = true
      }
    })
    this.setState({ flyingStars: flyingStars.filter((flyingStar) => !flyingStar.isDead) })
  }

  toHex = (value) => {
    let hex = value.toString(16)
    if (hex.length < 2) {
      hex = '0' + hex
    }
    return hex
  }

  refreshAsteroids = () => {
    const { asteroids, ctx } = this.state
    ctx.strokeStyle = 'black'
    const updatedAsteroids = []
    /* const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const centerZ = 0 */
    asteroids.forEach((asteroid) => {
      ctx.beginPath()
      const radius = asteroid.radius
      const scaledRadius = radius * Math.pow(2, -asteroid.z / 100)
      // const dist = Math.sqrt(Math.pow(centerX - asteroid.x, 2) + Math.pow(centerY - asteroid.y, 2) + Math.pow(centerZ - asteroid.z, 2))
      const newAsteroid = {
        ...asteroid,
        x: asteroid.x + asteroid.speed.x * (scaledRadius / 100),
        y: asteroid.y + asteroid.speed.y * (scaledRadius / 100),
        z: asteroid.z + asteroid.speed.z * (scaledRadius / 10),
        radius,
      }
      ctx.arc(asteroid.x - scaledRadius, asteroid.y - scaledRadius, scaledRadius, 0, 2 * Math.PI)
      ctx.lineWidth = 2
      // ctx.stroke()
      const colorYOffset = asteroid.colorYOffset
      const grd2 = ctx.createRadialGradient(asteroid.x - scaledRadius / 2,asteroid.y - colorYOffset*1.3*scaledRadius,colorYOffset*(scaledRadius / 2),asteroid.x - scaledRadius / 2, asteroid.y-colorYOffset*1.3*scaledRadius, colorYOffset*(1.7*scaledRadius))
      let shadowPercentage = Math.abs(asteroid.x / window.innerWidth)
      shadowPercentage = shadowPercentage > 1 ? 1 : shadowPercentage
      asteroid.colors.forEach((color, i) => {
        grd2.addColorStop(i/asteroid.colors.length, color)
      })
      ctx.fillStyle=grd2;
      ctx.fill()
      ctx.closePath()
      
      //ctx.globalAlpha = 0.5;
      ctx.beginPath()
      ctx.arc(asteroid.x - scaledRadius, asteroid.y - scaledRadius, scaledRadius, 0, 2 * Math.PI)
      ctx.lineWidth = 2
      //ctx.stroke()
      const grd3 = ctx.createRadialGradient(asteroid.x - scaledRadius / 2,asteroid.y - 1.3*scaledRadius,scaledRadius / 2,asteroid.x - scaledRadius / 2, asteroid.y-1.3*scaledRadius, 1.7*scaledRadius)
      grd3.addColorStop(0, '#00000000')
      grd3.addColorStop(1, '#FFFFFF')
      ctx.fillStyle=grd3;
      ctx.fill()
      ctx.closePath()

      ctx.beginPath()
      ctx.arc(asteroid.x - scaledRadius, asteroid.y - scaledRadius, scaledRadius, 0, 2 * Math.PI)
      ctx.lineWidth = 2
      //ctx.stroke()
      const grd4 = ctx.createRadialGradient(asteroid.x - scaledRadius * 1.6,asteroid.y - scaledRadius * 0.6,scaledRadius / 4,asteroid.x - scaledRadius * 1.6, asteroid.y-scaledRadius * 0.6, 2*scaledRadius)
      grd4.addColorStop(0, '#00000000')      
      grd4.addColorStop(1, '#000000')

      ctx.fillStyle=grd4
      ctx.fill()
      ctx.closePath()
      //ctx.globalAlpha = 1;
      updatedAsteroids.push(newAsteroid)
    })
    this.setState({ asteroids: updatedAsteroids })
  }

  refreshRocket = () => {
    const { ctx, rocket } = this.state
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
      const changeX = Math.cos(Math.radians(newRocket.rotation - 90))
      const changeY = Math.sin(Math.radians(newRocket.rotation - 90))

      if (!newRocket.smoking) {
        newRocket.speed.x = newRocket.speed.x + changeX
        newRocket.speed.y = newRocket.speed.y + changeY
      }
      if (!newRocket.smoking) {
      setTimeout(() => {
        this.setState((prevState) => ({ rocket: { ...prevState.rocket, smoking: false } }))
        }, Math.random() * 1000)
      }

      newRocket.smoking = true
      for (let i = 0; i < Math.random() * 5; i++) {
        const smokeX = newRocket.x - 20 * Math.cos(Math.radians(newRocket.rotation - 90))
        const smokeY = newRocket.y - 20 * Math.sin(Math.radians(newRocket.rotation - 90))
        const radius = Math.random() * 5
        const randX = Math.random()
        const randY = Math.random()

        const smokeSpeedX = newRocket.speed.x - 20 * Math.cos(Math.radians(newRocket.rotation - 90))
        const smokeSpeedY = newRocket.speed.y - 20 * Math.sin(Math.radians(newRocket.rotation - 90))

        const smokeSpeed = { x: (smokeSpeedX / 10 + randX) / 2, y: (smokeSpeedY / 10 + randY) / 2 }
        const colorValue = Math.floor(160 + Math.random() * 60)
        const smokeColor = `#${this.toHex(colorValue)}${this.toHex(colorValue)}${this.toHex(colorValue)}`
        newRocket.smoke = newRocket.smoke.concat({ x: smokeX, y: smokeY, radius, speed: smokeSpeed, timestamp: Date.now(), color: smokeColor })
      }
    }

    if (Math.random() < 0.005 && newRocket.thrust === 0) {
      const thrustDir = utils.generateDirection()
      newRocket.thrust = thrustDir
      newRocket.speed.rotation = newRocket.speed.rotation + thrustDir * 3
      setTimeout(() => {
        this.setState((prevState) => ({
          rocket: {
            ...prevState.rocket,
            thrust:0
          }
        }))
      }, 1000)
    }

    ctx.save();
    ctx.translate(newRocket.x,newRocket.y);
    ctx.rotate(newRocket.rotation*Math.PI/180);
    ctx.translate(-newRocket.x, -newRocket.y)
    ctx.beginPath()
    ctx.drawImage(this.rocketShipImage, newRocket.x - 45, newRocket.y - 26, 90, 52)
    if (newRocket.thrust !== 0) {
      ctx.translate(newRocket.x,newRocket.y);
      ctx.rotate(newRocket.thrust*90*Math.PI/180);
      ctx.translate(-newRocket.x, -newRocket.y)
      if (newRocket.thrust < 0) {
        ctx.drawImage(this.thrustImage, newRocket.x - 2, newRocket.y + 7, 20, 20)
      } else {
        ctx.drawImage(this.thrustImage, newRocket.x - 18, newRocket.y + 7, 20, 20)
      }
    }
    ctx.closePath()
    ctx.restore();

    ctx.strokeStyle = 'black'
    newRocket.smoke.forEach((particle, i) => {
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

    this.setState({ rocket: newRocket })
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
