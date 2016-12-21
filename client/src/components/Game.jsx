import React, { Component } from 'react'
import Board from './Board'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { loadBoard, resetBoardNew, resetBoardExisting } from '../actions/actionCreators'
import helpers from './helpers'

const Game = React.createClass({
  getInitialState () {
    return {
      boardSize: 4,
      mines: 4,
      gameNotes: null
    }
  },
  componentDidMount () {
    let board = []
    let n = this.state.boardSize
    let mines = this.state.mines

    helpers.makeBoard(board, n)
    helpers.generateMines(board, n, mines, this.props._mineBank)
    this.props.dispatch(resetBoardNew(n, mines))
    this.props.dispatch(loadBoard(board))
    this.setState({ validBoard: true })
  },
  handleSizeChange (e) {
    this.setState({ boardSize: e.target.value })
  },
  handleMineChange (e) {
    this.setState({ mines: e.target.value })
  },
  handleSubmit (e) {
    e.preventDefault()

    let n = this.state.boardSize
    let mines = this.state.mines
    this.setState({ validBoard: false })
    // Error handling for board size and mine count:
    if (isNaN(n) || isNaN(mines)) {
      this.setState({ errorMsg: 'Not a valid number' })
    } else if (+n <= 1 || +n > 100) {
      this.setState({ errorMsg: 'Board size must be between 2 and 100' })
    } else if (+mines >= (+n * +n) || +mines < 1) {
      this.setState({ errorMsg: 'Mine count must be fewer than number of cells on board and greater than 1.' })
    } else {
      // Valid board
      if (this.state.errorMsg) { this.setState({errorMsg: null}) }
      this.setState({ validBoard: true })

      let board
      // If board size does not change, do not re-generate board. Only reset stats and update mines and cover all cells
      if (parseInt(this.props.boardSize) === parseInt(this.state.boardSize)) {
        board = this.props.board
        this.props.dispatch(resetBoardExisting(mines))
      } else {
        this.props.dispatch(resetBoardNew(n, mines))
        board = []
        helpers.makeBoard(board, n)
        console.log('Made new board:', board)
      }
      helpers.generateMines( board, n, mines, this.props._mineBank)

      // Update board in application state once generated:
        this.props.dispatch(loadBoard(board))
    }
  },

  render () {

    let gameNotes
    let invalidBoard
    let partial
    let minesLeft = this.props.minesLeftToUser
    if (this.state.gameNotes) {
      gameNotes = this.state.gameNotes
    }
    if (this.state.errorMsg) {
      invalidBoard = this.state.errorMsg
    } else if (this.state.validBoard) {
      partial = <Board />
    }

    return (
      <div>
        
        <form className='game-setup' onSubmit={this.handleSubmit}>
          <section className='grid'>
            <div className='column--heavy'>
              How many rows/columns?
            </div>
            <div className='column--light'>
              <label className='textfield'>
                <input type='text' value={this.state.boardSize} onChange={this.handleSizeChange} className='input nboard' placeholder='10' />
              </label>
            </div>
          </section>
          <section className='grid'>
            <div className='column--heavy'>
              How many mines?
            </div>
            <div className='column--light'>
              <label className='textfield'>
                <input type='text' value={this.state.mines} onChange={this.handleMineChange} className='input mines' placeholder='10' />
              </label>
            </div>
          </section>
          <p className='text-red'>{invalidBoard}</p>
          <input type='submit' className='btn new-game' value='New Game' />
        </form>
        <section className='header'>
          <div>{minesLeft} mines left</div>
          <div> {gameNotes} </div>
        </section>
        {partial}
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
    minesLeftToUser: state.minesLeftToUser
  }
}

export default connect(mapStateToProps)(Game)
