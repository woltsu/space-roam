import React from 'react'

class Portfolio extends React.Component {
  render() {
    return (
      <div style={ styles.container }>
        <h1>Hello word!</h1>
      </div>
    )
  }
}

const styles = {
  container: {
    textAlign: 'center',
    maxWidth: '600px',
    minwidth: '200px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    flex: 1
  }
}

export default Portfolio