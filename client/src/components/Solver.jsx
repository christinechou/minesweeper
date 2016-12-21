import React from 'react'
import App from './App'
import Game from './Game'

const Solver = React.createClass({
  render () {
    return (
      <div className='solver'>
        <h1>
          <Link to='/'> Minesweeper </Link>
        </h1>
        {/*<Photo i={i} post={post} {...this.props} />*/}
        <section className='grid'>
          <div className='column'>
            How many games?
          </div>
          <div className='column--light'>
            <label className='textfield'>
              <input type='text' className='input n-games' value='1' placeholder='10' />
            </label>
          </div>
          <div>
            <input type='button' className='btn solver' value='Solve' />
          </div>
        </section>

        <div id='stats' />
      </div>
    )
  }
})

export default Solver
