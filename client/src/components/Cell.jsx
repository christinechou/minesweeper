import React from 'react'
import { connect } from 'react-redux'
import images from '../../assets/images'


const Cell = React.createClass({
  getInitialState () {
    return {
      // x: row,
      // y: col,
      // index: 0,
      // _neighboringMines: 0,
      // _isMine: false,
      // _flagged: false,
      // _revealed: false
    }
  },
  getMineImage (num) {
    var obj = {
      0: 'empty',
      1: 'one',
      2: 'two',
      3: 'three',
      4: 'four',
      5: 'five'
    }
    return obj[num]
  },

  render () {
    let covered
    let adjacentMines
    if (this.props.covered) {
      covered = 'covered'
    } else {
      covered = 'uncovered'
      adjacentMines = this.getMineImage(this.props.minesAdjacent)
    }
    return (
      <td id={this.props.index} className={`cell ${covered} ${adjacentMines}`} />
    )
  }
})

const mapStateToProps = (state) => {
  return {
    board: state.board,
    boardSize: state.boardSize
  }
}

export default connect(mapStateToProps)(Cell)
