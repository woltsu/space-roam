// Generic
import React, { Component } from 'react'
import utils from './utils'
import gameState from './gameState'

// Components
import Portfolio from './components/Portfolio'

// Services
import asteroidService from './services/asteroidService'
import flyingStarService from './services/flyingStarService'
import rocketService from './services/rocketService'
import graphicsService from './services/graphicsService'

// External libraries
import { Howl } from 'howler';

// Assets
import * as spaceSounds from './assets/deep_space.mp3'
import * as rocketShipImage from './assets/rocket-ship.png'
import * as thrustImage from './assets/thrust.png'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      fps: 60,
      music: null
    }
  }

  componentDidMount = () => {
    // Initialize the game and then start it
    this.initGameObjects()
    this.initCanvas()
    this.start()
  }

  initGameObjects = () => {
    // Generate all game objects
    gameState.setState({ asteroids: utils.generateAsteroids(30) })
    gameState.setState({ stars: utils.generateStars(window.innerWidth, window.innerHeight) })
    gameState.setState({ rocket: utils.generateRocket() })
  }

  initCanvas = () => {
    // Initialize canvas size, store its context and add an event listener
    // to make the canvas responsive
    const canvas = this.refs.canvas
    gameState.setState({ ctx: canvas.getContext('2d', { alpha: false }), canvas })
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
    const music = new Howl({
      src: [spaceSounds],
      autoplay: true,
      loop: true,
      volume: 0.5,
    });     
    music.play();
    this.setState({ music })

    // Load images
    const images = [ rocketShipImage, thrustImage ]
    utils.loadImages(images).then((result) => {
      gameState.setState({
        rocketShipImage: result[0],
        thrustImage: result[1]
      })

      // Start game loop
      requestAnimationFrame(this.updateState)
    })
  }

  // Runned every game loop:
  // 1. Redraw game
  // 2. Update all game objects
  updateState = (currentTimestamp) => {
    // Fps check is needed to make sure that the game doesn't exceed 60fps
    const { previousUpdateTimestamp } = gameState.getState()
    const diff = currentTimestamp - previousUpdateTimestamp
    if (diff >= 16) {
      gameState.setState({ previousUpdateTimestamp: currentTimestamp })
      graphicsService.redraw()
      this.updateAsteroids()
      this.updateRocket()
      this.updateFlyingStars()
    }
    requestAnimationFrame(this.updateState)
  }

  updateAsteroids = () => gameState.setState({ asteroids: asteroidService.updateAsteroids(gameState.getState().asteroids) })

  updateFlyingStars = () => gameState.setState({ flyingStars: flyingStarService.updateFlyingStars(gameState.getState().flyingStars) })

  updateRocket = () => gameState.setState({ rocket: rocketService.updateRocket(gameState.getState().rocket) })

  componentWillUnmount = () => this.state.music.stop()

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
