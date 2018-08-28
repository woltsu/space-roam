import React, { Component } from 'react'
import { Howl, Howler } from 'howler';
import * as spaceSounds from './assets/deep_space.mp3'
import * as rocketShipImage from './assets/rocket-ship.png'
import * as thrustImage from './assets/thrust.png'

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      asteroids: [],
      stars: [],
      rocket: null,
      ctx: null,
      radius: 10
    }
    this.fps = 60
  }

  componentDidMount = () => {
    this.initAsteroids()
    this.initStars()
    this.initRocket()
    const canvas = this.refs.canvas
    const ctx = canvas.getContext('2d')
    this.setState({ ctx: canvas.getContext('2d') })
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    window.addEventListener('resize', (event) => {
      console.log('dada')
      this.refs.canvas.width  = window.innerWidth
      this.refs.canvas.height = window.innerHeight
      this.initStars()
    });
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    /* this.sound = new Howl({
      src: [spaceSounds],
      autoplay: true,
      loop: true,
      volume: 0.5,
    });      */
    //this.sound.play();

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

  componentWillUnmount = () => {
    this.sound.stop()
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
      this.createAsteroid()
    }
  }

  generateDirection = () => Math.random() < 0.5 ? -1 : 1

  createAsteroid = () => {
    const { radius } = this.state
    const xDir = this.generateDirection()
    const yDir = this.generateDirection()
    const zDir = this.generateDirection()
    const speedX = Math.random() * xDir * 0.75
    const speedY = Math.random() * yDir * 0.75
    const speedZ = Math.random() * zDir * 0.25
    const r = Math.random() * 30
    const newAsteroid = {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: zDir < 0 ? 260 : -600,
      speed: { x: speedX, y: speedY, z: speedZ },
      radius: r
    }
    this.setState((prevState) => ({ asteroids: prevState.asteroids.concat(newAsteroid) }))
  }

  initRocket = () => {
    const xDir = this.generateDirection()
    const yDir = this.generateDirection()
    const zDir = this.generateDirection()
    const rotationDir = this.generateDirection()
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
    if (this.state.rocket) {
      rocket.smoke = this.state.rocket.smoke
    }
    this.setState({ rocket })
  }

  initAsteroids = () => {
    for (let i = 0; i < 30; i++) {
      this.createAsteroid(true)
    }
  }

  initStars = () => {
    const stars = []
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight
      stars.push({ x, y })
    }
    this.setState({ stars })
  }

  refreshCanvas = () => {
    const { ctx, stars } = this.state
    ctx.beginPath()
    ctx.clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height)
    ctx.closePath();
    ctx.beginPath()
    var grd=ctx.createLinearGradient(0, this.refs.canvas.height, this.refs.canvas.width, 0);
    grd.addColorStop(0.17, '#845EC2');
    grd.addColorStop(0.33, '#2C73D2');
    grd.addColorStop(0.5, '#0081CF');    
    grd.addColorStop(0.67, '#0089BA');
    grd.addColorStop(0.83, '#008E9B');
    grd.addColorStop(1, '#008F7A');
    ctx.fillStyle=grd;
    ctx.fillRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
    ctx.closePath();

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
        x: asteroid.x + asteroid.speed.x * (scaledRadius / 100),
        y: asteroid.y + asteroid.speed.y * (scaledRadius / 100),
        z: asteroid.z + asteroid.speed.z * (scaledRadius / 10),
        speed: asteroid.speed,
        radius
      }
      ctx.arc(asteroid.x - scaledRadius, asteroid.y - scaledRadius, scaledRadius, 0, 2 * Math.PI)
      ctx.lineWidth = 2
      ctx.stroke()
      const grd2 = ctx.createRadialGradient(asteroid.x - scaledRadius / 2,asteroid.y - 1.3*scaledRadius,scaledRadius / 2,asteroid.x - scaledRadius / 2, asteroid.y-1.3*scaledRadius, 1.7*scaledRadius)
      let shadowPercentage = Math.abs(asteroid.x / window.innerWidth)
      shadowPercentage = shadowPercentage > 1 ? 1 : shadowPercentage
      grd2.addColorStop(0.4, 'grey')
      grd2.addColorStop(1, 'lightgrey')     
      ctx.fillStyle=grd2;
      ctx.fill()
      ctx.closePath()
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
      const changeX = Math.cos(Math.radians(newRocket.rotation - 90)) * 0.5
      const changeY = Math.sin(Math.radians(newRocket.rotation - 90)) * 0.5

      if (!newRocket.smoking) {
        newRocket.speed.x = newRocket.speed.x + changeX
        newRocket.speed.y = newRocket.speed.y + changeY
      }
      newRocket.smoking = true
      setTimeout(() => {
        this.setState((prevState) => ({ rocket: { ...prevState.rocket, smoking: false } }))
      }, Math.random() * 2000)

      for (let i = 0; i < Math.random() * 5; i++) {
        const smokeX = newRocket.x - 20 * Math.cos(Math.radians(newRocket.rotation - 90))
        const smokeY = newRocket.y - 20 * Math.sin(Math.radians(newRocket.rotation - 90))
        const radius = Math.random() * 5
        const randX = Math.random()
        const randY = Math.random()

        const smokeSpeedX = newRocket.speed.x - 20 * Math.cos(Math.radians(newRocket.rotation - 90))
        const smokeSpeedY = newRocket.speed.y - 20 * Math.sin(Math.radians(newRocket.rotation - 90))

        const smokeSpeed = { x: (smokeSpeedX / 10 + randX) / 2, y: (smokeSpeedY / 10 + randY) / 2 }
        const colorValue = 160 + Math.random() * 60
        // const randCol = (Math.random() - 0.5) * 60
        // const getRandCol = () => Math.random() * 254
        const smokeColor = `rgb(${colorValue}, ${colorValue}, ${colorValue})`
        // const smokeColor = `rgb(${93 + randCol}, ${202 + randCol}, ${49 + randCol})`
        // const smokeColor = `rgb(${getRandCol()}, ${getRandCol()}, ${150})`
        newRocket.smoke = newRocket.smoke.concat({ x: smokeX, y: smokeY, radius, speed: smokeSpeed, timestamp: Date.now(), color: smokeColor })
      }
    }

    if (Math.random() < 0.005 && newRocket.thrust === 0) {
      const thrustDir = this.generateDirection()
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
      ctx.arc(particle.x, particle.y, particle.radius * (1-(lifetime/3000*particle.radius/7)), 0, 2 * Math.PI)
      ctx.lineWidth = 3
      //ctx.stroke()
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

  updateState = () => {
    this.refreshCanvas()
    this.refreshAsteroids()
    this.refreshRocket()
    this.clearOutOfBoundsAsteroids()
  }

  render() {
    return (
      <div style={ styles.container }>
        <canvas ref='canvas' />
      </div>
    );
  }
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
}

export default App;
