import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Game from './Game'
// import { SET_BOARD_SIZE, SET_MINE_COUNT } from '../actions/actionCreators'

// function mapStateToProps (state) {
//   return {
//     boardSize: state.boardSize,
//     mines: state.mines
//   }
// }
const App = React.createClass({
  render() {
    return (
      <div className='wrapper-small ta-center'>
        <h1>
          Minesweeper
        </h1>
          <Game />
          <input type='button' className='btn' value='Solver' />
        {/*React.cloneElement({...this.props}.children, {...this.props})*/}
      </div>
    )
  }
})

module.exports = App
