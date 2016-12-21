import React from 'react'
import { connect } from 'react-redux'
import Cell from './Cell'
import { clickCell } from '../actions/actionCreators'

const Row = React.createClass({
  getInitialState () {
    return {}
  },
  handleClick (e) {
    let row = Math.floor(e.target.id / this.props.boardSize)
    let col = e.target.id % this.props.boardSize
    console.log('ROW:', row,'COL:', col, this.props.board[row][col])
    let cell = this.props.board[row][col]
    if (cell.covered) {
      if (this.props.board[row][col].isMine) {
        console.log('is mine')
        // explosion here and end game
      } else {
        // reveal here
        this.props.dispatch(clickCell(row, col))
      }
    }
  },
  render () {
    return (
      <tr onClick={this.handleClick}> { this.props.row.map((cell) => {
        return (<Cell {...cell} key={cell.index} />)
      }) }</tr>
    )
  }
})

const mapStateToProps = (state) => {
  return {
    board: state.board,
    boardSize: state.boardSize
  }
}

export default connect(mapStateToProps)(Row)
