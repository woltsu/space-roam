const initialState = {
    asteroids: [],
    stars: [],
    rocket: null,
    flyingStars: [],
    ctx: null,
    radius: 10,
    bgColors: ['845EC2', '2C73D2', '0081CF', '0089BA', '008E9B', '008F7A'],
    currentBgColors: ['845EC2', '2C73D2', '0081CF', '0089BA', '008E9B', '008F7A'],
    bgCounter: 0,
    previousUpdateTimestamp: 0
}

let currentState = { ...initialState }

const setState = (newState) => {
  currentState = {
    ...currentState,
    ...newState
  }
}

const getState = () => {
  return currentState
}

export default {
  setState,
  getState
}
