import React from 'react'
import { connect } from 'react-redux'
import Row from './Row'

const Board = React.createClass({
  getInitialState () {
    return {
  //     status: null,
  //     sideLength: 10,
  //     _board: [], // [[1,2,3,4,5], [6,7,8,9,10], [11, 12, 13, 14, 15]...]
  //     _mines: {},
  //     _active: false,
  //     _minesLeft: 0,
  //     minesLeftToUser: 0
    }
  },

  initiateBoard () {

  },

  render () {
    let board
    if (this.props.board.length > 0) {
      board = this.props.board.map((row, i) => {
        return (
          <Row row={row} key={i} />
        )
      })
    }
    return (
      <div id='board'>
        <table className='board'>
          <tbody>
            {board}
          </tbody>
        </table>
      </div>
    )
  }
})

const mapStateToProps = (state) => {
  return {
    board: state.board,
    boardSize: state.boardSize,
    mines: state.mines,
    _mineBank: state._mineBank,
    active: state.active
  }
}
// Example of passing in props and using spread operator inside map:
// ShowCard poster={show.poster} title={show.title} key={show.imdbID} />
// Instead, use: <ShowCard {...show} key={show.imdbID} />
// Then when you're pulling it into ShowCard you're using {props.title} instead of {props.show.title} 

export default connect(mapStateToProps)(Board)

